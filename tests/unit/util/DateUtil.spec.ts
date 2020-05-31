jest.mock("@/store/StoreUtil", () => ({
  // セクションの開始時間は朝5時にする
  getSectionList: jest.fn(() => [{startTime: new Date(1970, 0, 1, 5, 0)}]),
}))

import StoreUtil from "@/store/StoreUtil"
import DateUtil from "@/util/DateUtil"

describe("DateUtil.ts", () => {
  describe("getDateObjectByDate", () => {
    describe("Store定義無しパターン", () => {
      beforeEach(() => {
        //
      })

      it("単純にがっちゃんこされるはず", () => {
        const baseDate = new Date(2019, 1, 1, 0, 0)
        const timeDate = new Date(1970, 0, 1, 10, 0)
        expect(DateUtil.getDateObjectByDate(baseDate, timeDate)).toEqual(new Date(2019, 1, 1, 10, 0))
      })
    })

    describe("Store定義ありパターン", () => {

      it("一日の開始セクションより後なので単純にがっちゃんこされるはず", () => {
        // 2019-2-1 0:00
        const baseDate = new Date(2019, 1, 1, 0, 0)
        // 1970-1-1 5:10
        const timeDate = new Date(1970, 0, 1, 5, 10)
        // 2019-2-1 5:10 になるはず
        expect(DateUtil.getDateObjectByDate(baseDate, timeDate)).toEqual(new Date(2019, 1, 1, 5, 10))
      })

      it("一日の開始セクションより前なので一日後の日付が返るはず", () => {
        // 2019-2-1 0:00
        const baseDate = new Date(2019, 1, 1, 0, 0)
        // 1970-1-1 4:00
        const timeDate = new Date(1970, 0, 1, 4, 0)
        // 2019-2-2 4:00 になるはず
        expect(DateUtil.getDateObjectByDate(baseDate, timeDate)).toEqual(new Date(2019, 1, 2, 4, 0))
      })
    })
  })
})

