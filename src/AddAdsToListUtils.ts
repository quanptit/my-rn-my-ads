import {NativeAdsView} from "my-rn-ads";
import {AdsObj, isEmpty, RNCommonUtils, sendError} from "my-rn-base-utils";
import {MyAdsAndSettingUtils} from "./MyAdsAndSettingUtils";

export class AddAdsToListUtils {
    static async getAdsObjAddToList(isLargeAds: boolean = true, typeAds: number = NativeAdsView.TYPE_DETAIL_VOCA): Promise<AdsObj> {
        if (await RNCommonUtils.isVIPUser()) {return null}
        return {large: isLargeAds, typeAds: typeAds};
    }

    /**
     * space = 4 tương đương với từ vựng có example hoặc câu hỏi chọn đáp án có 4 lựa chọn
     *
     * Thứ tự ưu tiên như sau
     * 1. Bên trên cái bài luyện tập giữa phần nội dung bài học và bài tập (giữa cái partDetail Bài Tập với bài học)
     * 2. Sau button kết quả nếu trước đó space > Max(SPACE_PREFER, totalSpace/4) không có quảng cáo. Lấy từ dưới lên
     * 3. Bottom List nếu trước đó space > 10 không có quảng cáo
     * 4. Nếu chưa đủ 3 quảng cáo thì cứ space = Max(16, totalSpace/3) thêm một quảng cáo
     */
    static async addAdsObjToListDetail(listData: any[], isLargeAds: boolean = true, typeAds: number = NativeAdsView.TYPE_DETAIL_VOCA) {
        if (await RNCommonUtils.isVIPUser()) {return}
        if (isEmpty(listData)) return;

        let countAds = 0;
        countAds = AddAdsToListUtils._addAdsCenterContentAndExercise(listData, countAds, typeAds);
        if (countAds >= 3) return;
        countAds = AddAdsToListUtils._addAdsAfterResultButton(listData, countAds, typeAds);
        if (countAds >= 3) return;
        countAds = AddAdsToListUtils._addAdsToBottom(listData, countAds, typeAds);
        if (countAds >= 3) return;
        countAds = AddAdsToListUtils._addAdsFollowSpace(listData, countAds, typeAds, 0);
        if (countAds >= 3) return;

        //region trên btn thông minh nếu đủ space
        // space = 0
        // for (let i = 0; i < listData.length; i++) {
        //     let item = listData[i]
        //     let type = item.type
        //     if (item.large != undefined) space = 0
        //     else {
        //         if (item.type === "btn_thong_minh" && space > 4) {
        //             listData.insert(i, {large: isLargeAds, typeAds: typeAds})
        //             countAds++
        //             if (countAds >= 3) { return}
        //             space = 0
        //             break
        //         } else {
        //             space += _caculatorSpace(item)
        //         }
        //     }
        // }
        //endregion
    }

    //region Add Ads flow space.
    private static _addAdsFollowSpace(listData: any[], currentCountAds: number, typeAds: number, countFromDeQui: number): number {
        if (countFromDeQui > 10) {
            sendError("addAdsFollowSpace can Loop Forever ============== ");
            return currentCountAds;
        }

        let space = 0;
        let listIndexStartToEnd: number[] = []; // Vị trí có thể thêm Ads. Tính từ trên xuống
        let listIndexEndToStart: number[] = []; // Vị trí có thể thêm Ads. Tính từ dưới lên
        let listIndexStartToEndPref: number[] = []; // Vị trí có thể thêm Ads. Tính từ dưới lên. Pref Ads
        let listIndexEndToStartPref: number[] = [];// Vị trí có thể thêm Ads. Tính từ dưới lên. Pref Ads
        for (let i = listData.length - 1; i >= 0; i--) {
            let rowData = listData[i];
            if (rowData.typeAds != null) {
                space = 0;
            } else {
                space += _caculatorSpace(rowData);
                if (space >= SPACE_PREFER) {
                    if (space >= SPACE_NORMAL)
                        listIndexEndToStart.push(i);
                    listIndexEndToStartPref.push(i);
                }
            }
        }

        space = 0;
        for (let i = 0; i < listData.length; i++) {
            let rowData = listData[i];
            if (rowData.typeAds != null) {
                space = 0;
            } else {
                space += _caculatorSpace(rowData);
                if (space >= SPACE_PREFER) {
                    if (space >= SPACE_NORMAL) {
                        listIndexStartToEnd.push(i + 1);
                    }
                    listIndexStartToEndPref.push(i);
                }
            }
        }

        let listIndexMatch: number[] = [];
        let listIndexMatchPref: number[] = [];
        for (let integer of listIndexEndToStart) {
            if (listIndexStartToEnd.includes(integer))
                listIndexMatch.push(integer);
        }
        for (let integer of listIndexEndToStartPref) {
            if (listIndexStartToEndPref.includes(integer))
                listIndexMatchPref.push(integer);
        }
        if (listIndexMatchPref.length == 0) return currentCountAds;

        // Add Prefer Ads
        //1. Sau một cái Html dài, hoặc liên tiếp các item text hoặc html mà có space > 25
        for (let integer of listIndexMatchPref) {
            if (isPreferHtmlDai(listData, integer)) {
                currentCountAds++;
                listData.insert(integer, {large: true, typeAds: typeAds});
                if (currentCountAds < 3)
                    AddAdsToListUtils._addAdsFollowSpace(listData, currentCountAds, typeAds, countFromDeQui + 1);
                return currentCountAds;
            }
        }
        //2. Bên trên PartSummary
        for (let integer of listIndexMatchPref) {
            let item = listData[integer];
            if (item.childId || item.id) {
                currentCountAds++;
                listData.insert(integer, {large: true, typeAds: typeAds});
                if (currentCountAds < 3)
                    AddAdsToListUtils._addAdsFollowSpace(listData, currentCountAds, typeAds, countFromDeQui + 1);
                return currentCountAds;
            }
        }

        if (listIndexMatch.length == 0) return currentCountAds;
        for (let indexAddAds of listIndexMatch) {
            if ((indexAddAds > 0 && indexAddAds < listData.length - 1) && canNotAddAdsCenter(listData[indexAddAds - 1], listData[indexAddAds + 1]))
                continue;
            currentCountAds++;
            listData.insert(indexAddAds, {large: true, typeAds: typeAds});
            if (currentCountAds < 3)
                AddAdsToListUtils._addAdsFollowSpace(listData, currentCountAds, typeAds, countFromDeQui + 1);
            return currentCountAds;
        }

        return currentCountAds;
    }

    //endregion

    //region Thêm quảng cáo vào cuối list nếu trước đó ko xa không có quảng cáo
    private static _addAdsToBottom(listData: any[], currentCountAds: number, typeAds: number): number {
        let space = 0;
        for (let i = listData.length - 1; i >= 0; i--) {
            let item = listData[i];
            if (item.large == undefined) {
                space += _caculatorSpace(item)
            } else break
        }
        if (space > SPACE_PREFER) {
            listData.push({large: true, typeAds: typeAds});
            currentCountAds++;
            if (currentCountAds >= 3) { return currentCountAds}
        }
        if (currentCountAds == 0 && listData.length > 0) {
            listData.push({large: true, typeAds: typeAds});
            currentCountAds++;
        }
        return currentCountAds
    }

    //endregion

    //region Sau button kết quả nếu trước đó space > Max(SPACE_PREFER, totalSpace/4) không có quảng cáo. Lấy từ dưới lên
    private static _addAdsAfterResultButton(listData: any[], currentCountAds: number, typeAds: number): number {
        let SPACE_ALLOW = Math.max(SPACE_PREFER, listData.length / 4);
        if (listData.length < 3) return currentCountAds;

        for (let i = listData.length - 3; i >= 0; i--) {
            let item = listData[i];
            let type = item.type;
            if (type === "bt_luyen_nghe" || type === "SHOW_ANSWER") {
                if (checkCanAddAds(listData, i, SPACE_ALLOW)) {
                    listData.insert(i + 1, {large: true, typeAds: typeAds});
                    ++currentCountAds;
                    if (currentCountAds >= 3) { return currentCountAds;}
                }
            }
        }
        return currentCountAds;
    }

    //endregion

    //region Giữa cái partDetail Bài Tập với bài học. Với phía trước vị trí add space = 16 không có quảng cáo
    // return currentCountAds after add
    private static _addAdsCenterContentAndExercise(listData: any[], currentCountAds: number, typeAds: number): number {
        let space = 0;
        for (let i = 0; i < listData.length; i++) {
            let item = listData[i];
            if (item.lesson && item.lesson.practice && space > SPACE_PREFER) {
                space = 0;
                listData.insert(i, {large: true, typeAds: typeAds});
                currentCountAds++;
                if (currentCountAds >= 3) { return currentCountAds}
            } else
                space += _caculatorSpace(item);
        }
        return currentCountAds;
    }

    //endregion

    //region  Add To List Summary
    static async addAdsObjToListSummary(listData: any[], addMyAdsSetting?: { androidID: string }) {
        if (await RNCommonUtils.isVIPUser()) {return}
        if (isEmpty(listData)) return;
        let isAddMyAds;
        if (addMyAdsSetting != null) {
            isAddMyAds = await MyAdsAndSettingUtils.addMyAdsToList(listData, addMyAdsSetting.androidID);
        }

        if (listData.length < 5) {
            listData.push({large: true, typeAds: NativeAdsView.TYPE_SUMMARY_LARGE, allowBannerBackup: true});
            return
        }
        listData.insert(isAddMyAds ? 4 : 3, {large: true, typeAds: NativeAdsView.TYPE_SUMMARY_LARGE, allowBannerBackup: true});
        if (listData.length > 22) {
            listData.insert(21, {large: true, typeAds: NativeAdsView.TYPE_SUMMARY_LARGE, allowBannerBackup: true});
            if (listData.length > 35)
                listData.push({large: true, typeAds: NativeAdsView.TYPE_SUMMARY_LARGE, allowBannerBackup: true});
        } else if (listData.length > 16) {
            listData.push({large: true, typeAds: NativeAdsView.TYPE_SUMMARY_LARGE, allowBannerBackup: true});
        }
    }

    //endregion
}

const SPACE_PREFER = 12;
const SPACE_NORMAL = 26;

//region calulator space

function _caculatorSpace(item) {
    if (item.voca)
        return getSpaceOfVoca(item);
    if (item.dapDans)
        return getSpaceOfMultichoice(item);

    if (item.lesson && item.lesson.practice) return 2;
    let type = item.type;
    if ("multi_choice" === type)
        return getSpaceOfMultichoice(item.dataJsonObj);
    else if ("html" === type || "text" === type || "text_html" === type || "writing" === type)
        return _spaceOfText(item.content);
    else if ("bh_video" === type)
        return 2;
    else
        return 1;
}

function getSpaceOfMultichoice(obj): number {
    if (obj == null) return 0;
    let result = 0;
    if (obj.img)
        result += 2;
    if (obj.instruction)
        result += 1;

    if (obj.dapDans)
        return result + obj.dapDans.length;
    return 1 + result;
}

function getSpaceOfVoca(vocaObj): number {
    if (vocaObj == null) return 0;
    let result = 2;
    if (vocaObj.sample)
        result += vocaObj.sample.length;
    return result;
}

/** retun >1, càng to => text càng dài*/
function _spaceOfText(str): number {
    if (isEmpty(str)) return 0;
    return Math.floor(str.length / 100);
}

//endregion

//region utils
function checkCanAddAds(listData: any[], index: number, SPACE_ALLOW: number): boolean {
    if (index == 0 || index >= listData.length - 1) return false;
    let itemBefore = listData[index - 1];
    let itemAfter = listData[index + 1];
    if (canNotAddAdsCenter(itemBefore, itemAfter)) return false;

    //for After
    let spaceAfter = 0;
    for (let i = index + 1; i < listData.length; i++) {
        let item = listData[i];
        if (item.large || item.typeAds)
            break;
        spaceAfter += _caculatorSpace(item);
        if (spaceAfter >= SPACE_ALLOW)
            break;
    }
    if (spaceAfter < SPACE_ALLOW) return false;

    // For Before
    let spaceBefore = 0;
    for (let i = index - 1; i >= 0; i--) {
        let item = listData[i];
        if (item.large || item.typeAds)
            break;
        spaceBefore += _caculatorSpace(item);
        if (spaceBefore >= SPACE_ALLOW)
            break;
    }
    if (spaceBefore < SPACE_ALLOW) return false;
    return true;
}

function isPreferHtmlDai(listData: any[], index: number) {
    index--;
    let space = 0;
    while (index >= 0) {
        let baseObj = listData[index];
        if (isPartOfText(baseObj)) {
            space += _caculatorSpace(baseObj);
            if (space > SPACE_PREFER)
                return true;
        } else
            return false;
        index = index - 1;
    }
    return false;
}

function isPartOfText(item): boolean {
    let type = item.type;
    if (type == "html" || type == "text_html" || type == "paragraph" || type == "text" || type == "writing")
        return true;
    return false;
}

function canNotAddAdsCenter(itemBefore, itemAfter): boolean {
    let type1 = itemBefore.type;
    let type2 = itemAfter.type;
    if ("voca_phatam" == type1 && "voca_phatam" == type2)
        return true;
    if ("sentence_record" == type1 && "sentence_record" == type2)
        return true;
    return false;
}

//endregion
