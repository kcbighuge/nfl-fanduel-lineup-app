# NFL DFS Lineup Optimizer

A web application for optimizing daily fantasy sports lineups for FanDuel NFL contests. Upload your player pool, customize constraints, and generate optimal lineups ready for upload back to FanDuel.

## Features

- **CSV Import**: Upload FanDuel's player export file directly
- **AI-Powered News Analysis**: Automatically scans player news, team updates, opponent matchups, and weather conditions to identify value plays
- **Smart Projection Adjustments**: Surfaces opportunities where players are likely to outperform their baseline projections
- **Lineup Optimization**: Generate mathematically optimal lineups using linear programming
- **Customizable Constraints**: Fine-tune lineup generation with exposure limits, stacking rules, and player locks/exclusions
- **Multi-Lineup Generation**: Create up to 150 unique lineups for large-field GPP contests
- **FanDuel Export**: Download optimized lineups in FanDuel's upload format

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

- Node.js 18+ or Python 3.10+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nfl-dfs-optimizer.git
cd nfl-dfs-optimizer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Usage

### 1. Export Players from FanDuel

1. Log in to FanDuel and navigate to an NFL contest lobby
2. Click **"Download Players List"** to get the CSV file
3. Save the file to your computer

### 2. Upload to the Optimizer

1. Open the optimizer app
2. Click **"Upload CSV"** or drag and drop your FanDuel player export
3. The app will parse and display all available players

### 3. Configure Optimization Settings

#### Basic Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Number of Lineups | How many unique lineups to generate | 20 |
| Max Player Exposure | Maximum % of lineups a single player can appear in | 100% |
| Min Salary Used | Minimum total salary to use per lineup | $59,000 |

#### Player Controls

- **Lock**: Force a player into every lineup
- **Exclude**: Remove a player from consideration entirely
- **Set Exposure**: Limit how often a specific player appears (0-100%)

#### Stacking Rules

| Stack Type | Description |
|------------|-------------|
| QB + WR/TE | Pair quarterback with pass catchers from same team |
| RB + DEF | Pair running back with opposing defense (game script correlation) |
| Bring Back | Include a player from the opposing team of your QB stack |

#### Game Stacks

- Select specific games to build lineups around
- Exclude players from certain games (weather, late swap concerns)

## News Intelligence

The optimizer automatically aggregates and analyzes real-time information from across the web to identify edges that static projections miss.

### Data Sources

| Category | Information Gathered |
|----------|---------------------|
| **Player News** | Injury updates, practice participation, snap count trends, target share changes |
| **Team News** | Offensive line changes, coaching staff updates, scheme adjustments, pace of play trends |
| **Opponent Analysis** | Defensive rankings, cornerback matchups, pass rush efficiency, run defense vulnerabilities |
| **Weather Conditions** | Wind speed, precipitation, temperature, dome/outdoor status |
| **Vegas Lines** | Game totals, spreads, implied team totals, line movement |

### How It Works

1. **Automated Scanning**: When you upload your player pool, the app fetches the latest news for all players and teams
2. **Sentiment Analysis**: News items are analyzed to determine positive or negative impact on player value
3. **Projection Adjustments**: The system suggests projection boosts or discounts based on aggregated intelligence
4. **Opportunity Alerts**: Players flagged as potential value plays are highlighted in the interface

### Opportunity Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔥 **Smash Spot** | Multiple positive factors align (weak opponent, good weather, increased role) |
| 📈 **Upgrade** | Recent news suggests player will exceed baseline projection |
| ⚠️ **Monitor** | Uncertainty exists (questionable injury status, weather concerns) |
| 📉 **Downgrade** | Negative factors present (tough matchup, reduced role, poor conditions) |
| ❄️ **Weather Risk** | Wind >15mph, precipitation, or extreme cold expected |

### Example Insights

```
📈 WR Amon-Ra St. Brown — UPGRADE +3.2 pts
   • Jameson Williams ruled OUT (increased target share)
   • Facing CAR defense allowing most WR points (32.4 PPG)
   • Indoor game, no weather concerns

🔥 RB De'Von Achane — SMASH SPOT +4.1 pts  
   • Raheem Mostert downgraded to OUT
   • Vegas implied team total: 27.5 (3rd highest)
   • Opponent LAC allowing 5.2 YPC to RBs

⚠️ QB Josh Allen — MONITOR
   • Questionable with elbow injury, practiced limited Friday
   • Weather: 28°F, 12mph wind in Buffalo
   • Consider exposure limits until Sunday confirmation

📉 DEF Dallas Cowboys — DOWNGRADE -2.0 pts
   • DeMarcus Lawrence OUT, Micah Parsons questionable  
   • Facing BAL with highest rushing EPA in league
```

### Adjusting Based on News

You can choose how to incorporate news intelligence:

| Mode | Description |
|------|-------------|
| **Auto-Adjust** | Projections automatically modified based on news analysis |
| **Suggested** | View recommendations but manually approve changes |
| **Off** | Ignore news data, use baseline projections only |

### Manual Overrides

- Click any player to view all relevant news items
- Adjust the suggested projection modifier (-5 to +5 points)
- Add personal notes for late-swap decisions

### 4. Generate Lineups

1. Click **"Optimize"** to run the optimizer
2. Review generated lineups in the results table
3. Analyze exposure breakdown and salary distribution

### 5. Export for FanDuel

1. Click **"Export CSV"**
2. Save the file
3. On FanDuel, go to your contest and click **"Upload Lineups"**
4. Select your exported CSV file

## CSV Format

### Input Format (FanDuel Export)

The app expects FanDuel's standard player export format:

```csv
Id,Position,First Name,Last Name,FPPG,Played,Salary,Game,Team,Opponent,Injury Indicator,Injury Details,Roster Position
12345,QB,Patrick,Mahomes,20.5,16,8500,KC@LV,KC,LV,,,"QB"
```

### Output Format (FanDuel Upload)

The app generates lineups in FanDuel's required upload format:

```csv
QB,RB,RB,WR,WR,WR,TE,FLEX,DEF
12345,23456,34567,45678,56789,67890,78901,89012,90123
```

## Optimization Algorithm

The optimizer uses mixed-integer linear programming (MILP) to find optimal solutions:

1. **Objective**: Maximize total projected points
2. **Constraints**:
   - Exactly 9 players per lineup
   - Salary ≤ $60,000
   - Position requirements met
   - User-defined exposure limits
   - Uniqueness constraints between lineups

Each subsequent lineup is generated with constraints preventing duplicate combinations from previous solutions.

## Configuration Options

### Environment Variables

```bash
# Optional: Set default optimization parameters
DEFAULT_LINEUP_COUNT=20
DEFAULT_MIN_SALARY=59000
DEFAULT_MAX_EXPOSURE=100

# News Intelligence settings
NEWS_REFRESH_INTERVAL=300      # Seconds between news updates (default: 5 min)
WEATHER_API_KEY=your_key       # National Weather Service (optional, free tier available)
ENABLE_NEWS_ANALYSIS=true      # Toggle news features on/off
```

### Advanced Settings

```javascript
// Available in settings panel
{
  "randomness": 0,           // Add variance to projections (0-20%)
  "minUniquePlayers": 3,     // Min players different between lineups
  "allowQBWithOppDef": false // Allow QB stacked with opposing defense
}
```

## Projections

### Baseline Projections

The app uses FanDuel's FPPG (Fantasy Points Per Game) by default. For custom projections:

1. Add a `Projection` column to your CSV before uploading
2. Or manually edit projections in the player table after import
3. Popular projection sources: FantasyPros, 4for4, numberFire

### News-Enhanced Projections

When News Intelligence is enabled, the optimizer creates adjusted projections:

```
Adjusted Projection = Baseline + News Modifier + Weather Modifier + Matchup Modifier
```

| Modifier Type | Range | Example Triggers |
|---------------|-------|------------------|
| News Modifier | -3 to +4 | Teammate injury, role change, coach quotes |
| Weather Modifier | -4 to 0 | High wind (pass game), extreme cold, rain |
| Matchup Modifier | -2 to +3 | Coverage shadow, defensive DVOA, pace up/down |

View the full projection breakdown for any player by clicking their row in the player table.

## Tips for GPP Contests

- Use **lower exposure limits** (20-40%) for contrarian builds
- **Stack aggressively** — correlate your QB with 2-3 pass catchers
- Enable **bring back** to capture shootout game scripts
- Target **late-swap flexibility** by avoiding early game locks
- Generate **100+ lineups** and manually curate to 20 for upload
- **Leverage news alerts** — players with 📈 or 🔥 indicators often outperform ownership
- **Fade weather risk** — reduce exposure to outdoor games with ❄️ warnings
- **Monitor injury reports** — check the app Sunday morning for final inactive news

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CSV not parsing | Ensure you're using FanDuel's official export file |
| No valid lineups | Reduce constraints or check for conflicting locks |
| Missing players | Verify player isn't injured (Injury Indicator = O) |
| Export not uploading | Confirm contest hasn't locked and format matches |
| News not loading | Check internet connection; data refreshes every 5 minutes |
| Stale injury info | Click "Refresh News" to pull latest updates |
| Weather data missing | Outdoor stadium games only; dome games show N/A |

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS  
- **Optimization**: HiGHS solver via highs-js
- **File Processing**: Papa Parse
- **News Aggregation**: Web scraping + RSS feeds + API integrations
- **Weather Data**: National Weather Service API
- **Vegas Lines**: Real-time odds aggregation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Disclaimer

This tool is for entertainment purposes only. Daily fantasy sports involve risk. Please play responsibly and in accordance with your local laws and regulations. This project is not affiliated with or endorsed by FanDuel.
