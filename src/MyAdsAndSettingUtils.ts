/**
 * File setting chứa list Ads sẽ phải được cache có path là: RNFetchBlob.fs.dirs.CacheDir + "/ads"
 * Có một list app trong mục preferApp:
 - App nào đã click => không hiển thị lại nữa
 - index 1: hiển thị 10 lần. nếu quá 10 lần -> sau 10 ngày sẽ được reset lại số lần hiển thị
 - index 2: hiển thị 5 lần
 - index >2 => hiển thị 3 lần
 * */
import RNFetchBlob from 'rn-fetch-blob'
import {FileUtils, isEmpty, isIOS, PreferenceUtils, RNAppUtils} from "my-rn-base-utils";

export class MyAdsAndSettingUtils {

    static async addMyAdsToList(listItem: any[], androidID: string): Promise<boolean> {
        if (isEmpty(listItem)) return false;
        let preferApp = await MyAdsAndSettingUtils.getPreferAds(androidID);
        if (preferApp) {
            preferApp.isMyAds = true;
            listItem.insert(0, preferApp);
            return true
        }
        return false
    }

    static async getPreferAds(androidID: string) {
        let filePath = RNFetchBlob.fs.dirs.CacheDir + "/ads";
        if (await FileUtils.exists(filePath)) {
            let str = await FileUtils.readFile(filePath);
            let json = JSON.parse(str);
            if (json) {
                let preferApp = await MyAdsAndSettingUtils._getPreferAdsFromList(json.preferApp, androidID);
                if (preferApp != undefined) {
                    return preferApp;
                } else {
                    return null; // chỉ lấy ở preferApp
                    // return MyAdsAndSettingUtils._getPreferAdsFromList(json.tieng_anh);
                }
            }
        }
    }

    static async _getPreferAdsFromList(apps: any[], androidID: string) {
        if (isEmpty(apps)) return undefined;
        for (let i = 0; i < apps.length; i++) {
            let preferApp = apps[i];
            if (preferApp.package == undefined) {
                if (preferApp.url_schemes != undefined)
                    preferApp.package = preferApp.url_schemes;
                else if (preferApp.id != undefined)
                    preferApp.package = preferApp.id;
            }
            if (await MyAdsAndSettingUtils.canShowMyAds(i, preferApp.package, androidID)) {
                await MyAdsAndSettingUtils.showMyAds(preferApp.package);
                return preferApp;
            }
        }
    }

    static async showMyAds(packageName: string) {
        let noShow = await PreferenceUtils.getNumberSetting("SHOW_" + packageName);
        noShow++;
        await PreferenceUtils.saveSeting("SHOW_" + packageName, noShow);
    }

    static async clickMyAds(packageName: string) {// Sẽ ko show ra ads đã được click nữa
        await PreferenceUtils.saveBooleanSetting("CLICK_" + packageName, true);
    }

    static async canShowMyAds(index: number, packageName: string, androidID: string): Promise<boolean> {
        if (packageName === androidID) return false;
        if (!isIOS()) {
            if (await RNAppUtils.ANDROID_isAppInstalled(packageName)) return false;
        }

        if (await PreferenceUtils.getBooleanSetting("CLICK_" + packageName)) return false;

        let noShow = await PreferenceUtils.getNumberSetting("SHOW_" + packageName);
        if (index === 0 && noShow > 10) return false;
        if (index === 1 && noShow > 5) return false;
        if (index >= 2 && noShow > 2) return false;

        return true
    }
}
