## Installation

##### Thêm Vào package.json
```
"my-rn-my-ads": "git+https://gitlab.com/react-native-my-libs/my-rn-my-ads.git",
```

Chạy  lệnh sau
```
yarn install
```

### DialogKiemVangAndVip

```javascript
DialogKiemVangAndVip.showDialog({
                title: getStrings().you_need_vip, titleKiemVang: getStrings().view_ads_for_download,
                onShowAds: () => {
                    gold -= 10;
                    PreferenceUtils.saveSeting("GOLD", gold);
                    addDownloadFun()
                }
            });
```

### ButtonKiemVang
```javascript
    _renderButtonGold(): any {
        if (this._isVip()) return;
        return (<ButtonKiemVang title={getStringsCommon().kem_10_vang} isShowDialog={true} textStyle={{color: "white"}}
                                onShowAds={async () => {
                                    let gold = await PreferenceUtils.getNumberSetting("GOLD", 100);
                                    gold += 10;
                                    console.log("_Reward Received Callback: ", gold);
                                    await PreferenceUtils.saveSeting("GOLD", gold);
                                    this.updateGold(gold);
                                }}/>)
    }
```
