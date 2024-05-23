import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }))

/* taskObj = {
    id: "int >= 0"
    description: "task description",
    status: COMPLETED, INPROG, WAITING
}*/

const [COMPLETED, INPROG, WAITING] = ["1", "0", "-1"];
var IDcounter = 0;
var tasks = [];
for (let i = 0; i < 10; i++)
    tasks.push({
        id: `${IDcounter}`,
        description: `this is a task and its suppoes to be long like that ${IDcounter++}`,
        status: WAITING
    });


app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/views/instructions.html`);
});

app.get("/tasks", (req, res) => {
    res.render("tasks.ejs", { tasks: tasks })
});

app.get("/tasks/:id", (req, res) => {
    const taskID = req.params.id;
    const task = tasks.find((task) => task.id === taskID);
    if (!task) {
        res.status(400).send({ error: `there is no task witn an id of ${taskID}.` })
    } else {
        res.render("tasks.ejs", { tasks: [task] });
    }

})

app.post("/addTask", (req, res) => {
    const { description } = req.body;
    const newTask = { description: description, id: `${IDcounter++}`, status: WAITING };
    var isDup = false;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].description === newTask.description) {
            isDup = true;
            break;
        }
    }
    if (isDup) {
        res.status(409).send({ error: "Task already exists. Duplicate tasks are not allowed." });

    } else {
        tasks.push(newTask);
        res.status(200).send({ success: `the task added to the todo-list with ID=${newTask.id}.` });
    }

});

app.delete("/deleteTask/:id", (req, res) => {
    const taskID = req.params.id;
    const taskIndex = tasks.findIndex((task) => task.id === taskID);
    if (taskIndex === -1) {
        res.status(400).send({ error: `there is no task witn an ID=${taskID}.` })
    } else {
        tasks.splice(taskIndex, 1);
        res.status(200).send({ success: `the task witn an ID=${taskID} was removed.` })
    }
});


app.put("/putTask/:id", (req, res) => {
    const taskID = req.params.id;
    const taskIndex = tasks.findIndex((task) => task.id === taskID);
    if (taskIndex === -1) {
        res.status(400).send({ error: `there is no task witn an ID=${taskID}.` })
    } else {
        const { description } = req.body;
        tasks[taskIndex] = { ...tasks[taskIndex], description: description, status: WAITING };
        res.status(200).send({ success: `the task witn an ID=${taskID} was updated.` })
    }
});

app.patch("/updateStatus/:id", (req, res) => {
    const taskID = req.params.id;
    const { status } = req.body;
    if (![WAITING, INPROG, COMPLETED].includes(status)) {
        res.status(400).send({ error: `${status} is invalid status, valid status: -1 = waiting, 0 = in proggress, 1 = completed.` });
        return;
    }
    const taskIndex = tasks.findIndex((task) => task.id === taskID);
    if (taskIndex === -1) {
        res.status(400).send({ error: `there is no task witn an ID=${taskID}.` });
    } else {
        const oldStatus = tasks[taskIndex].status;
        if (oldStatus === status) {
            res.status(400).send({ error: `Task with ID=${taskID} is already in status=${status}` });
        } else {
            tasks[taskIndex].status = status;
            res.status(200).send({ success: `The status of task with ID=${taskID} was changed from ${oldStatus} to ${status}` });
        }
    }
});


app.listen(port, () => {
    console.log(`Server running on ${port}`);
});