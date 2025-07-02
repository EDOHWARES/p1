const AMI = require("asterisk-manager");
const config = require("../config");
const {
  add_entry_to_database,
  pop_unprocessed_line,
} = require("../utils/entries");
const pressedNumbers = new Set();

const ami = new AMI(
  config.asterisk.port,
  config.asterisk.host,
  config.asterisk.username,
  config.asterisk.password,
  true
);
ami.keepConnected();

ami.on("connect", () => {
  console.log("AMI is connected");
});

ami.on("error", (err) => {
  console.error("AMI Connection Error:", err);
});

ami.on("managerevent", (data) => {
  if (data?.event == "DTMFBegin" && data?.digit == "1") {
    if (!pressedNumbers.has(data?.exten)) {
      console.log(`+${data?.exten} has pressed 1`);

      pressedNumbers.add(data?.exten);
      add_entry_to_database(data?.exten);
    } else {
      console.log(`+${data?.exten} has already pressed 1, ignoring duplicate`);
    }
  }

  if (data?.event == "Newstate" && data?.channelstatedesc == "Up") {
    console.log(`Call answered on channel: ${data?.channel}`);
  }

  if (data?.event === "Hangup") {
    console.log(
      `Call with +${data?.calleridnum} has ended with reason ${data["cause-txt"]}`
    );
    require("./call")(pop_unprocessed_line());
  }
});

function waitForConnection() {
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (ami.connected) {
        clearInterval(check);
        resolve();
      }
    }, 1000);
  });
}

module.exports = { ami, waitForConnection };
