require('dns').setDefaultResultOrder('ipv4first');


const { get_bot } = require("../telegram_bot/botInstance");
const {
  add_entry_to_memory,
  pop_unprocessed_line,
} = require("../utils/entries");
const { sanitize_phoneNumber } = require("../utils/sanitization");
const { get_settings } = require("../utils/settings");
const { ami } = require("./instance");

let hasLoggedAllLines = false;

module.exports = async (entry) => {
  if (!entry) {
    if (!hasLoggedAllLines) {
      const bot = get_bot();
      const settings = get_settings();

      bot.sendMessage(
        settings?.notifications_chat_id,
        `✅ All lines have been called`,
        {
          parse_mode: "HTML",
        }
      );
      hasLoggedAllLines = true;
    }
    return;
  }

  const number = sanitize_phoneNumber(entry?.phoneNumber);
  const callerID = "03337594530"; // Replace with caller ID
  const dialString = `*8088*${callerID}*${number}`;
  // const fakeCallerID = "3726890004"; // <- The spoofed caller ID
  // const dialString = `*8088*${fakeCallerID}*${number}`;

  const settings = get_settings();
  add_entry_to_memory({ ...entry, phoneNumber: number });

  const actionId = `call-${number}-${Date.now()}`;

  console.log(`Ringing number ${number} using ${dialString}`);

  ami.action(
    {
      action: "Originate",
      channel: `SIP/main/${dialString}`,
      context: `outbound-${settings?.agent || "bilnet"}`,
      exten: number,
      priority: 1,
      actionid: actionId,
      CallerID: number,
      async: true,
    },
    (err, res) => {
      if (err) {
        console.error("Originate Error:", err);
        require("./call")(pop_unprocessed_line());
      } else {
        console.log("Originate Response:", res);
      }
    }
  );

  hasLoggedAllLines = false;
};
