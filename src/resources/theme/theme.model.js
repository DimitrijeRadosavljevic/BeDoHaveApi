export class Theme {

    constructor(id, title, description, date, reminder, tags, scheduleAnswer, published) {
        
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.reminder = reminder;
        this.tags = tags;
        this.scheduleAnswer = scheduleAnswer;
        this.public = published;
    }
}
