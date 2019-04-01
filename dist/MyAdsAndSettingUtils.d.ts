export declare class MyAdsAndSettingUtils {
    static addMyAdsToList(listItem: any[], androidID: string): Promise<boolean>;
    static getPreferAds(androidID: string): Promise<any>;
    static _getPreferAdsFromList(apps: any[], androidID: string): Promise<any>;
    static showMyAds(packageName: string): Promise<void>;
    static clickMyAds(packageName: string): Promise<void>;
    static canShowMyAds(index: number, packageName: string, androidID: string): Promise<boolean>;
}
