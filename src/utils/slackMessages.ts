import { env } from '../env/server';

export function postHotStreak(wins: number, name: string) {
  if (wins >= 3) {
    const message = {
      channel: env.SLACK_CHANNEL_ID,
      text: `:eyes: Look out! ${name} is out for your Elo :scream:! They're on a ${wins} game win streak, it's time for someone to dethrone them :ping-pong::rage:`,
    };

    if (wins >= 5) {
      message.text = `:fire: HOT STREAK ALERT!!! :fire: ${name} is on a ${wins} game win streak :cold_sweat:! Someone take them down :smiling_imp: :triumph: :muscle::skin-tone-3:`;
    }

    // TODO - more variety of messages?

    fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
        Authorization: env.SLACK_AUTH_TOKEN,
      },
    });
  }
}
