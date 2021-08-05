exports.createScheduleClinic = (req) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
    req.body;

  const getWorkingHours = (day) => {
    JSON.parse(day).map((hours) => {
      let startTime, endTime;
      if (!hours.length) {
        startTime = 0;
        endTime = 0;
      } else {
        startTime = hours[0];
        endTime = hours[1];
      }
      return { startTime, endTime };
    });
  };

  return [
    {
      dayOfWeek: 0,
      workingHours: getWorkingHours(sunday),
    },
    {
      dayOfWeek: 1,
      workingHours: getWorkingHours(monday),
    },
    {
      dayOfWeek: 2,
      workingHours: getWorkingHours(tuesday),
    },
    {
      dayOfWeek: 3,
      workingHours: getWorkingHours(wednesday),
    },
    {
      dayOfWeek: 4,
      workingHours: getWorkingHours(thursday),
    },
    {
      dayOfWeek: 5,
      workingHours: getWorkingHours(friday),
    },
    {
      dayOfWeek: 6,
      workingHours: getWorkingHours(saturday),
    },
  ];
};
