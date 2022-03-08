const {format_date} = require('../utils/helpers');



test('format_date() returns a date string', () => {
    const date = new Date('2020-03-20 16:12:03');
  
    expect(format_date(date)).toBe('4/20/2022');
});h