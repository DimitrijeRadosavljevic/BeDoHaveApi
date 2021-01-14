export class Habit {

  constructor(id, name, description, date, frequency, frequencySpecific, tags) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.date = date;
    this.frequency = frequency;
    this.frequencySpecific = frequencySpecific;

    this.tags = tags;
  }

}
