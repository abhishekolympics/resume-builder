const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobs: [
    {
      jobName: { type: String, required: true },
      jobLink: { type: String, required: true },
    },
  ],
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
