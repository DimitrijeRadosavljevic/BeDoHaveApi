export class Habit {

  constructor(id, name, description, frequency, frequencySpecific, tags) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.frequency = frequency;
    this.frequencySpecific = frequencySpecific;

    this.tags = tags;
  }

}
