# KSRTC Bus Seat Alerts 🚌

An automated system that checks KSRTC (Kerala State Road Transport Corporation) bus seat availability every 5 minutes and sends email notifications when seats become available for your desired route.

## Frontend Repository 🎨

The frontend code for this project is available at:
[KSRTC Bus Alerts Frontend](https://github.com/aswanth6000/ksrtc-bus-alerts-frontend)

## Features ✨

- 🔄 Automated checks every 5 minutes using GitHub Actions
- 📧 Email notifications when seats are available
- ⏰ Time range preference for bus departures
- 🎯 Route-specific alerts
- 🗑️ Auto-deletion of alerts once notified

## Tech Stack 🛠️

- Node.js
- TypeScript
- Express.js
- MongoDB
- GitHub Actions
- Nodemailer
- AWS Lambda (Serverless)

## Environment Variables 🔐

Create a `.env` file in the root directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
EMAIL=your_gmail_address
PASSWORD=your_gmail_app_password
```

## Installation 💻

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ksrtc-bus-alerts.git
cd ksrtc-bus-alerts
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints 🌐

### Create Alert

```http
POST /alerts
```

Request body:

```json
{
  "email": "user@example.com",
  "searchUrl": "https://onlineksrtcswift.com/search?fromCity=298|Bangalore&toCity=472|Iritty&departDate=28-03-2025",
  "timeRangeStart": "06:00",
  "timeRangeEnd": "23:00"
}
```

## GitHub Actions Workflow ⚡

The project uses GitHub Actions to run checks every 5 minutes. The workflow:

1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Runs the seat availability checker
5. Sends email notifications if seats are available

## Deployment 🚀

The application is deployed on AWS Lambda using the Serverless Framework. To deploy:

```bash
serverless deploy
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📝

This project is licensed under the ISC License.

## Support 💬

For support, email aswanth682@gmail.com or open an issue in the repository.
