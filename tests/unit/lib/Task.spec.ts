import Task from '@/lib/Task';

describe('Task.ts', () => {
  const task = new Task(new Date('2018-12-06 0:54:03'), 'タスクのテスト');
  it('セクションの初期値はundefined', () => {
      expect(task.section).toEqual(undefined);
  });

  // 日付は一律1990-01-01にする。そうしないとソートが上手くいかないため
  it('セクションの値は1990年としてセットされているか?', () => {
      task.section = new Date('2019-01-19 9:00:00');
      expect(task.section).toEqual(new Date('1990-01-01 9:00:00:00'));
  });

  it('cloneテスト', () => {
      task.section = new Date('2019-01-19 12:00:00');
      const newTask = task.clone();
      const s = newTask.section
      if (s != undefined) {
        expect(s).toEqual(task.section);
      }
  });

  it('createPauseテスト', () => {
      task.section = new Date('2019-01-19 15:00:00');
      const newTask = task.createPauseTask();
  });

  it('作成日が入っているか?', () => {
    expect(task.createTime).not.toBeNull();
  });

  it('作成直後は更新日に作成日と同じ日付が入っているか?', () => {
    expect(task.updateTime).toBe(task.createTime);
  });

  it('コピーしたオブジェクトの作成日がディープコピーされているか?', () => {
    // 現在の日付というのが難しいので値が入っているかどうかだけチェック
    const date = new Date('2018-10-11 00:01:02');
    task.createTime = date;
    const task2 = task.clone();
    // オブジェクトは違うが
    expect(task2.createTime).not.toBe(date);
    // 日付は同じはず
    expect(task2.createTime).toEqual(date);
  });

  it('コピーしたオブジェクトの更新日がディープコピーされているか?', () => {
    // 現在の日付というのが難しいので値が入っているかどうかだけチェック
    const date = new Date('2018-10-11 00:01:02');
    task.updateTime = date;
    const task2 = task.clone();
    // オブジェクトは違うが
    expect(task2.updateTime).not.toBe(date);
    // 日付は同じはず
    expect(task2.updateTime).toEqual(date);
  });

  it('中断したオブジェクトの作成日が現在日付になっているか', () => {
    // 現在の日付というのが難しいので元のタスクのオブジェクトと違って何か値が入っているかを確認
    const date = new Date('2018-10-11 00:01:02');
    task.createTime = date;
    const task2 = task.createPauseTask();
    // オブジェクトは違うはず
    expect(task2.createTime).not.toBe(date);
    // 日付も同じでは無いはず
    expect(task2.createTime).not.toEqual(date);
    // 何か値が入っているはず
    expect(task2.createTime).not.toBeNull();
  });

});
