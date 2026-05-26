"use client";

import { useRef, useCallback, useEffect } from "react";
import { GridWorld, encodeState } from "@/lib/rl/env";
import { QLearningAgent } from "@/lib/rl/qlearning";
import { SarsaAgent } from "@/lib/rl/sarsa";
import { MonteCarloAgent } from "@/lib/rl/montecarlo";
import { Agent } from "@/lib/rl/agent";
import { AgentConfig, AlgorithmType, GridConfig, SimStats } from "@/lib/rl/types";
import { getStateValue } from "@/lib/rl/policy";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";
import { renderGrid } from "@/lib/viz/render";

const TRAIL_LENGTH = 10;
const STATS_THROTTLE_MS = 100;

export interface SimulationRefs {
  env: GridWorld;
  agent: Agent;
  trail: [number, number][];
  episodeReward: number;
  episodeSteps: number;
  recentRewards: number[];
  recentLengths: number[];
  recentTdErrors: number[];
}

function createAgent(
  algorithm: AlgorithmType,
  numStates: number,
  config: AgentConfig
): Agent {
  switch (algorithm) {
    case "sarsa":
      return new SarsaAgent(numStates, { ...config });
    case "montecarlo":
      return new MonteCarloAgent(numStates, { ...config });
    case "qlearning":
    default:
      return new QLearningAgent(numStates, { ...config });
  }
}

export function useSimulation() {
  const {
    gridConfig,
    agentConfig,
    algorithm,
    isPlaying,
    speed,
    vizOptions,
    setStats,
    setIsPlaying,
    setAgentConfig,
  } = usePlaygroundStore();

  const refs = useRef<SimulationRefs | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastStatsUpdate = useRef<number>(0);
  const currentAlgorithm = useRef<AlgorithmType>(algorithm);

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const vizOptionsRef = useRef(vizOptions);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    vizOptionsRef.current = vizOptions;
  }, [vizOptions]);

  const initRefs = useCallback(
    (
      config: GridConfig,
      agentConf: AgentConfig,
      algo: AlgorithmType
    ): SimulationRefs => {
      const env = new GridWorld(config);
      const agent = createAgent(algo, env.numStates, agentConf);
      currentAlgorithm.current = algo;
      return {
        env,
        agent,
        trail: [],
        episodeReward: 0,
        episodeSteps: 0,
        recentRewards: [],
        recentLengths: [],
        recentTdErrors: [],
      };
    },
    []
  );

  useEffect(() => {
    refs.current = initRefs(gridConfig, agentConfig, algorithm);
  }, [gridConfig, agentConfig, algorithm, initRefs]);

  useEffect(() => {
    if (refs.current) {
      refs.current.agent.config = { ...agentConfig };
    }
  }, [agentConfig]);

  const runStep = useCallback(() => {
    if (!refs.current) return false;

    const { env, agent, trail } = refs.current;
    const state = env.state;
    const action = agent.selectAction(state);
    const { nextState, reward, done } = env.step(action);

    agent.update(state, action, reward, nextState, done);

    refs.current.episodeReward += reward;
    refs.current.episodeSteps++;

    trail.push([env.agentRow, env.agentCol]);
    if (trail.length > TRAIL_LENGTH) {
      trail.shift();
    }

    if (agent.lastTdError > 0) {
      refs.current.recentTdErrors.push(agent.lastTdError);
      if (refs.current.recentTdErrors.length > 100) {
        refs.current.recentTdErrors.shift();
      }
    }

    if (done) {
      agent.onEpisodeEnd();

      refs.current.recentRewards.push(refs.current.episodeReward);
      refs.current.recentLengths.push(refs.current.episodeSteps);

      if (refs.current.recentRewards.length > 50) {
        refs.current.recentRewards.shift();
        refs.current.recentLengths.shift();
      }

      refs.current.episodeReward = 0;
      refs.current.episodeSteps = 0;
      refs.current.trail = [];
      env.reset();

      return true;
    }

    return false;
  }, []);

  const runEpisode = useCallback(() => {
    if (!refs.current) return;

    let steps = 0;
    const maxSteps = refs.current.env.config.maxSteps;

    while (steps < maxSteps) {
      const episodeDone = runStep();
      steps++;
      if (episodeDone) break;
    }
  }, [runStep]);

  const updateStats = useCallback(() => {
    if (!refs.current) return;

    const { agent, recentRewards, recentLengths, recentTdErrors } = refs.current;

    const meanReward =
      recentRewards.length > 0
        ? recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length
        : 0;

    const meanLength =
      recentLengths.length > 0
        ? recentLengths.reduce((a, b) => a + b, 0) / recentLengths.length
        : 0;

    const meanTdError =
      recentTdErrors.length > 0
        ? recentTdErrors.reduce((a, b) => a + b, 0) / recentTdErrors.length
        : 0;

    let minValue = 0;
    let maxValue = 0;
    const { rows, cols, cells } = refs.current.env.config;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cells[r][c].type === "wall") continue;
        const state = encodeState(r, c, cols);
        const v = getStateValue(agent.qValues, state);
        if (v < minValue) minValue = v;
        if (v > maxValue) maxValue = v;
      }
    }

    const stats: Partial<SimStats> = {
      episode: recentRewards.length,
      totalSteps: refs.current.env.stepCount,
      epsilon: agent.config.epsilon,
      meanReward,
      meanEpisodeLength: meanLength,
      meanTdError,
      rewardHistory: [...recentRewards],
      minValue,
      maxValue,
    };

    setStats(stats);
    setAgentConfig({ epsilon: agent.config.epsilon });
  }, [setStats, setAgentConfig]);

  const render = useCallback(() => {
    if (!canvasRef.current || !refs.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { env, agent, trail } = refs.current;

    renderGrid(
      ctx,
      env.config,
      agent.qValues,
      env.agentRow,
      env.agentCol,
      trail,
      vizOptionsRef.current
    );
  }, []);

  useEffect(() => {
    let frameId: number;

    const tick = (timestamp: number) => {
      if (!isPlayingRef.current || !refs.current) {
        render();
        frameId = requestAnimationFrame(tick);
        return;
      }

      const stepsPerFrame = Math.max(1, Math.floor(speedRef.current / 60));

      for (let i = 0; i < stepsPerFrame; i++) {
        runStep();
      }

      render();

      if (timestamp - lastStatsUpdate.current > STATS_THROTTLE_MS) {
        updateStats();
        lastStatsUpdate.current = timestamp;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [runStep, render, updateStats]);

  const reset = useCallback(() => {
    if (!refs.current) return;

    refs.current.env.reset();
    refs.current.agent.reset(refs.current.env.numStates);
    refs.current.agent.config = { ...agentConfig, epsilon: 1.0 };
    refs.current.trail = [];
    refs.current.episodeReward = 0;
    refs.current.episodeSteps = 0;
    refs.current.recentRewards = [];
    refs.current.recentLengths = [];
    refs.current.recentTdErrors = [];

    setAgentConfig({ epsilon: 1.0 });
    setStats({
      episode: 0,
      totalSteps: 0,
      epsilon: 1.0,
      meanReward: 0,
      meanEpisodeLength: 0,
      meanTdError: 0,
      rewardHistory: [],
      minValue: 0,
      maxValue: 0,
    });

    render();
  }, [agentConfig, setAgentConfig, setStats, render]);

  const switchAlgorithm = useCallback(() => {
    if (!refs.current) return;

    const newAgent = createAgent(
      algorithm,
      refs.current.env.numStates,
      { ...agentConfig, epsilon: 1.0 }
    );

    refs.current.agent = newAgent;
    refs.current.env.reset();
    refs.current.trail = [];
    refs.current.episodeReward = 0;
    refs.current.episodeSteps = 0;
    refs.current.recentRewards = [];
    refs.current.recentLengths = [];
    refs.current.recentTdErrors = [];
    currentAlgorithm.current = algorithm;

    setAgentConfig({ epsilon: 1.0 });
    setStats({
      episode: 0,
      totalSteps: 0,
      epsilon: 1.0,
      meanReward: 0,
      meanEpisodeLength: 0,
      meanTdError: 0,
      rewardHistory: [],
      minValue: 0,
      maxValue: 0,
    });

    render();
  }, [algorithm, agentConfig, setAgentConfig, setStats, render]);

  const stepAction = useCallback(() => {
    setIsPlaying(false);
    runStep();
    updateStats();
    render();
  }, [runStep, updateStats, render, setIsPlaying]);

  const stepEpisode = useCallback(() => {
    setIsPlaying(false);
    runEpisode();
    updateStats();
    render();
  }, [runEpisode, updateStats, render, setIsPlaying]);

  return {
    canvasRef,
    refs,
    reset,
    stepAction,
    stepEpisode,
    switchAlgorithm,
    render,
  };
}
