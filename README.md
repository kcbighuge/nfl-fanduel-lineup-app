# NFL DFS Lineup Optimizer

A High-performance web application for optimizing daily fantasy sports lineups for FanDuel NFL contests. Upload your player pool, customize constraints, and generate optimal lineups ready for upload back to FanDuel.

## Features

- **CSV Import**: Upload FanDuel's player export file directly.
- **Simulated News Intelligence**: Demonstrates AI-powered analysis of player news, injuries, and matchup data to identify value plays.
- **Smart Projection Adjustments**: Allows manual and news-based adjustments to player projections.
- **Lineup Optimization**: Generates multiple unique lineups using a fast heuristic optimization algorithm.
- **Customizable Constraints**: Fine-tune lineup generation with exposure limits and player locks/exclusions.
- **FanDuel Export**: Download optimized lineups in the official FanDuel upload format.

## FanDuel NFL Roster Requirements

| Position | Count |
|----------|-------|
| QB | 1 |
| RB | 2 |
| WR | 3 |
| TE | 1 |
| FLEX (RB/WR/TE) | 1 |
| DEF | 1 |
| **Salary Cap** | **$60,000** |

## Getting Started

### Prerequisites

- Node.js 18+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/kcbighuge/nfl-fanduel-lineup-app.git
cd nfl-fanduel-lineup-app/app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

## Usage

### 1. Export Players from FanDuel

1. Log in to FanDuel and navigate to an NFL contest lobby.
2. Click **"Download Players List"** to get the CSV file.
3. Save the file to your computer.

### 2. Upload to the Optimizer

1. Open the optimizer app.
2. Click **"Upload CSV"** or drag and drop your FanDuel player export.
3. The app will parse and display all available players.

### 3. Configure Optimization Settings

#### Global Settings

- **Number of Lineups**: Generate up to 150 unique lineups.
- **Min Salary**: Ensure lineups use at least a minimum total salary (e.g., $59,500).
- **Uniqueness**: Set the minimum number of players that must differ between any two lineups.
- **Randomness**: Add a percentage of variance to projections to create more diverse builds.

#### Player Controls

- **Lock**: Force a player into every generated lineup.
- **Exclude**: Remove a player from consideration.
- **Exposure Limit**: Set a maximum percentage of lineups a specific player can appear in.
- **Projection Adjustment**: Manually boost or discount a player's projected points.

## News Intelligence (Simulated)

The application features a simulated News Intelligence engine to demonstrate how real-time data can be integrated into the optimization workflow.

### Opportunity Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔥 **Smash Spot** | Positive alignment of matchup, role, and conditions. |
| 📈 **Upgrade** | News suggests player is likely to exceed baseline projection. |
| ⚠️ **Monitor** | Uncertainty exists (e.g., questionable injury status). |
| 📉 **Downgrade** | Negative factors present (tough matchup, reduced role). |
| ❄️ **Weather Risk** | Significant wind or precipitation expected for outdoor games. |

## Technical Implementation

### Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Custom design system)
- **CSV Parsing**: [Papa Parse](https://www.papaparse.com/)

### Optimization Algorithm

The current implementation uses a **Greedy Heuristic with Constraints** to generate high-quality lineups quickly within the browser. 

1.  **Selection**: The algorithm iteratively picks the best available players for each position based on projected points and value (Pts/Salary).
2.  **Constraints**: It respects the $60,000 salary cap, roster requirements (1 QB, 2 RB, 3 WR, 1 TE, 1 FLEX, 1 DEF), and user-defined exposure limits.
3.  **Diversity**: Multi-lineup generation is achieved by introducing randomness and enforcing a minimum number of unique players between iterations.

*Note: While `highs` is included in dependencies, the current version uses the heuristic approach for immediate feedback. Future versions will offer a toggle for the HiGHS MILP solver.*

## Development

```bash
# Run linting
npm run lint

# Build for production
npm run build
```

## Disclaimer

This tool is for entertainment purposes only. Daily fantasy sports involve risk. Please play responsibly and in accordance with your local laws and regulations. This project is not affiliated with or endorsed by FanDuel.

## License

MIT License

