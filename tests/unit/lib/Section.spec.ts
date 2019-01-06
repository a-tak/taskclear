import Section from '@/lib/Section';

describe('Section.ts', () => {
  const sectionName = '朝のセクション';
  const section = new Section();
  section.title = sectionName;
  section.startTime = new Date('2018-04-12 9:00:00');

  it('タイトル取れるか?', () => {
    expect(section.title).toBe(sectionName);
  });

  // startDateでソートするので日付は1990/01/01にしてセットする仕様
  it('startDateの年月日は1990-01-01に統一されているか?', () => {
    expect(section.startTime).toEqual(new Date('1990-01-01 9:00:00'));
  });

  // リスト表示するときに一意のIDは必要なので結局UUID振る事にした
  it('idが自動採番されているか?', () => {
    expect(section.id).not.toBeNull();
  });

  it('コピーしたオブジェクトがディープコピーされているか?', () => {
    // 現在の日付というのが難しいので値が入っているかどうかだけチェック
    const section2 = section.clone();
    // オブジェクトは違うが
    expect(section2).not.toBe(section);
    // 中身は同じはず
    expect(section2.title).toEqual(sectionName);
  });


});
