exports.createScheduleClinic = (req) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
    req.body;

  const getWorkingHours = (day) =>
    JSON.parse(day)
      .filter((hours) => hours.length)
      .map((hours) => ({ startTime: hours[0], endTime: hours[1] }));

  const data = [
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

  return data;
};
