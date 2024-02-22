const mqtt = require('mqtt');

module.exports = (req, res) => {

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  const notification = req.body;

  if (!notification.data || !notification.data.environment || !notification.data.environment.id) {
    res.status(400).json({ message: 'Environment ID is required' });
    return;
  }

  const brokerUrl = 'mqtts://io.adafruit.com';
  const options = {
    port: 8883,
    username: process.env.ADAFRUIT_IO_USERNAME,
    password: process.env.ADAFRUIT_IO_KEY,
    clientId: Math.floor(Math.random() * 10000)
  };
  const topic = process.env.ADAFRUIT_IO_USERNAME + '/f/vip-' + notification.data.environment.id;
  const payload = {
    value: notification,
  };
  const payloadString = JSON.stringify(payload);

  const client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    client.publish(topic, payloadString, (err) => {
      if (err) {
        console.error('Failed to publish message for ' + notification.data.environment.id + ':', err);
        client.end();
        res.status(500).json({ message: 'Failed to publish message for ' + notification.data.environment.id });
      } else {
        console.log('Message published successfully for ' + notification.data.environment.id);
        client.end();
        res.status(200).json({ message: 'Message published successfully for ' + notification.data.environment.id });
      }
    });
  });

  client.on('error', (error) => {
    console.error('Failed to connect:', error);
    res.status(500).json({ message: 'Failed to connect' });
  });

}