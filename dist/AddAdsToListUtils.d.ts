import { AdsObj } from "my-rn-base-utils";
export declare class AddAdsToListUtils {
    static getAdsObjAddToList(isLargeAds?: boolean, typeAds?: number): Promise<AdsObj>;
    /**
     * space = 4 tương đương với từ vựng có example hoặc câu hỏi chọn đáp án có 4 lựa chọn
     *
     * Thứ tự ưu tiên như sau
     * 1. Bên trên cái bài luyện tập giữa phần nội dung bài học và bài tập (giữa cái partDetail Bài Tập với bài học)
     * 2. Sau button kết quả nếu trước đó space > Max(SPACE_PREFER, totalSpace/4) không có quảng cáo. Lấy từ dưới lên
     * 3. Bottom List nếu trước đó space > 10 không có quảng cáo
     * 4. Nếu chưa đủ 3 quảng cáo thì cứ space = Max(16, totalSpace/3) thêm một quảng cáo
     */
    static addAdsObjToListDetail(listData: any[], isLargeAds?: boolean, typeAds?: number): Promise<void>;
    private static _addAdsFollowSpace;
    private static _addAdsToBottom;
    private static _addAdsAfterResultButton;
    private static _addAdsCenterContentAndExercise;
    static addAdsObjToListSummary(listData: any[], addMyAdsSetting?: {
        androidID: string;
    }): Promise<void>;
}
