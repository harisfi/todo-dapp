// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ToDo {
    struct Task {
        uint id;
        string description;
        bool completed;
    }

    Task[] public tasks;
    uint nextId = 1;

    event TaskAdded(uint id, string description);
    event TaskCompleted(uint id);

    function addTask(string memory _description) public {
        tasks.push(Task(nextId, _description, false));
        emit TaskAdded(nextId, _description);
        nextId++;
    }

    function completeTask(uint _id) public {
        require(_id > 0 && _id <= tasks.length, "Invalid task ID");
        tasks[_id - 1].completed = true;
        emit TaskCompleted(_id);
    }

    function getTasks() public view returns (Task[] memory) {
        return tasks;
    }
}