# Wellness MCP Server

A Python MCP server providing AI-powered wellness tracking tools with facial emotion analysis, mood tracking, and crisis detection.

## Features

### Wellness Tools
- **Mood Check-in**: Record daily moods with AI emotional analysis
- **Stress Monitoring**: Real-time facial stress detection using Hume AI
- **Wellness Goals**: Create and track personalized wellness goals
- **Mindfulness Exercises**: Generate personalized meditation and breathing exercises
- **Crisis Support**: AI-powered crisis detection with emergency resources

### Integrations
- **Google Gemini AI**: Emotional analysis and personalized recommendations
- **Hume AI**: Facial emotion recognition for stress monitoring
- **Google BigQuery**: Scalable data storage and analytics
- **Google Text Embedding**: Semantic search across wellness history

## Setup Instructions

### 1. Install Dependencies
```bash
cd wellness-mcp-server
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure API Keys

Copy the environment template and add your API keys:

```bash
cp .env.example .env
```

**Required API Keys:**

#### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env`: `GEMINI_API_KEY=your_key_here`

#### Hume AI
1. Visit [Hume AI](https://beta.hume.ai/)
2. Sign up and get your API key
3. Add to `.env`: `HUME_API_KEY=your_key_here`

#### Google BigQuery
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing one
3. Enable BigQuery API
4. Create a service account key (JSON file)
5. Set environment variables:
   ```
   BIGQUERY_PROJECT_ID=your-project-id
   BIGQUERY_DATASET_ID=wellness_data
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   ```

### 3. MCP Configuration

**For VS Code/Cline users:**

Update your MCP settings file located at:
- **Windows**: `c:\Users\[USERNAME]\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Copy the configuration from `mcp-settings-template.json` into your settings file. Update all paths and API keys.

The server will automatically create BigQuery tables when first run.

### 4. Run the Server

To test locally (optional):
```bash
python wellness_mcp_server.py
```

The MCP server is now ready to be used through your MCP-enabled assistant!

## API Endpoints

The MCP server exposes these tools:

### mood_check_in
- **Input**: mood_score (1-10), text_description, user_id
- **Output**: Emotional analysis and AI insights

### stress_monitoring
- **Input**: image_data (base64), ppg_data, user_id
- **Output**: Facial emotion analysis and stress recommendations

### set_wellness_goal
- **Input**: goal_type, description, target_value, user_id
- **Output**: AI-enhanced SMART goal creation

### provide_mindfulness
- **Input**: exercise_type, current_emotions, duration_minutes, user_id
- **Output**: Personalized mindfulness exercise

### crisis_support_check
- **Input**: user_id, timeframe_days
- **Output**: Crisis assessment and emergency resources

## Data Storage

Wellness data is stored in Google BigQuery tables:
- `mood_entries`: Daily mood tracking
- `stress_sessions`: Facial analysis sessions
- `wellness_goals`: User goals and progress
- `mindfulness_sessions`: Exercise sessions

## Security & Privacy

- All data encrypted in BigQuery
- Facial images processed client-side and not stored
- Crisis detection includes emergency contact information
- User consent required for camera access

## Troubleshooting

### Common Issues:

1. **BigQuery Authentication**: Ensure service account key is properly configured
2. **Hume API**: Check API key permissions for facial analysis
3. **Gemini API**: Verify API key and model availability
4. **MCP Connection**: Ensure server is running and MCP settings are correct

### Debug Mode

Set environment variable for detailed logging:
```bash
export DEBUG=true
python wellness_mcp_server.py
```

## License

This project is part of the AI-Powered-Study-Assistant system.
