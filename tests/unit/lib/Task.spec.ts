import Task from '@/lib/Task';

describe('Task.ts', () => {
    const task = new Task(new Date('2018-12-06 0:54:03'), 'タスクのテスト');
    it('初期値は空', () => {
        expect(task.section).toMatch('');
    });

    it('値がセットできるか?', () => {
        task.section = 'A';
        expect(task.section).toMatch('A');
    });

    it('copyテスト', () => {
        task.section = 'B';
        const newTask = task.copy();
        expect(newTask.section).toMatch(task.section);
    });

    it('createPauseテスト', () => {
        task.section = 'C';
        const newTask = task.createPauseTask();
    });
});
