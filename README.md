# RL Policy Playground

Interactive visualization of reinforcement learning agents navigating grid worlds. Watch a small agent learn to reach a goal while a real-time value function heatmap shows what the agent believes about expected rewards from each state.

## Features

- **Grid World Environment**: Configurable 5x5 to 20x20 grid with start, goal, walls, rewards, and penalties
- **Value Function Heatmap**: Color-coded visualization of V(s) — brighter teal cells have higher expected future reward
- **Policy Arrows**: See the agent's preferred action in each cell, with opacity indicating confidence
- **Three Algorithms**: Q-learning, SARSA, and first-visit Monte Carlo with adjustable hyperparameters
- **Full Editor**: Paint walls, rewards, and penalties; adjust grid size; add stochastic transitions
- **Training Controls**: Play/pause, speed control (1 to 10,000 steps/sec), step-by-step execution
- **Preset Environments**: Open Field, Cliff Walk, Four Rooms, Windy Grid, and Maze

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| N | Step Episode |
| S | Step Action |
| R | Reset |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the playground.

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand for state management
- Canvas API for visualization

## Project Structure

```
app/
  layout.tsx          Root layout with fonts and metadata
  page.tsx            Main playground page
  globals.css         Design tokens and global styles
components/
  playground/         Visualization and control components
    GridCanvas.tsx    Main canvas for grid rendering
    ControlPanel.tsx  Play/pause/step controls
    AlgorithmPanel.tsx  Algorithm selector
    HyperparameterPanel.tsx  Learning parameters
    EditorPanel.tsx   Environment editing tools
    StatsPanel.tsx    Training statistics
    RewardChart.tsx   Episode reward sparkline
    Explainer.tsx     Algorithm explanations
  ui/                 Reusable UI primitives
lib/
  rl/                 Reinforcement learning algorithms
    env.ts            GridWorld environment
    qlearning.ts      Q-learning agent
    sarsa.ts          SARSA agent
    montecarlo.ts     Monte Carlo agent
    presets.ts        Built-in environment layouts
  sim/                Simulation loop and state management
    useSimulation.ts  Main simulation hook
    useGridLayout.ts  Grid editing utilities
  viz/                Canvas rendering utilities
    colors.ts         OKLCH color interpolation
    render.ts         Grid drawing functions
  store/              Zustand store configuration

```

## Algorithms

### Q-Learning (Off-Policy TD)
Updates toward the greedy action regardless of the action actually taken:
```
Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]
```

### SARSA (On-Policy TD)
Updates toward the action that was actually taken next:
```
Q(s,a) ← Q(s,a) + α[r + γ·Q(s',a') − Q(s,a)]
```

### First-Visit Monte Carlo
Waits until episode ends, then updates from actual returns:
```
Q(s,a) ← Q(s,a) + α[Gₜ − Q(s,a)]
```

## Design

Scientific instrument aesthetic with a dark charcoal background (#0B0C0E), muted teal (#4FB3A9) for positive values, and burnt orange (#D87B3C) for negative values and the agent. Monospace fonts (Space Mono) for numeric displays, Space Grotesk for headings.
