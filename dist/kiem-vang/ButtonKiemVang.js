import React, { Component } from 'react';
import { getStringsCommon } from "my-rn-common-resource";
import { RNAdsUtils } from "my-rn-ads";
import { PreferenceUtils } from "my-rn-base-utils";
import { Button, ButtonModel, DialogUtils, Spinner, Toast } from "my-rn-base-component";
/**Nếu video chưa ready => loading, load xong show cái title*/
export class ButtonKiemVang extends Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: true };
    }
    rewardVideoAdDidReceiveCallback() {
        this.setState({ isLoading: false });
    }
    async componentDidMount() {
        if (await RNAdsUtils.canShowRewardVideoAds())
            this.setState({ isLoading: false });
        else {
            this._startProgressCheckLoadAdsComplete();
            RNAdsUtils.loadRewardVideoAds();
        }
    }
    componentWillUnmount() {
        this._cancelProgressCheckLoadAdsComplete();
    }
    _startProgressCheckLoadAdsComplete() {
        this._cancelProgressCheckLoadAdsComplete();
        this.timeInterval = setInterval(async () => {
            if (await RNAdsUtils.canShowRewardVideoAds()) {
                this.setState({ isLoading: false });
                this._cancelProgressCheckLoadAdsComplete();
            }
        }, 600);
    }
    _cancelProgressCheckLoadAdsComplete() {
        if (this.timeInterval != undefined) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }
    render() {
        if (this.state.isLoading) {
            return <Spinner size={"small"} style={{ marginLeft: 8, marginRight: 8 }}/>;
        }
        return (<Button {...this.props} title={this.props.title} model={ButtonModel.transparent} onPress={async () => {
            this.props.onPress && this.props.onPress();
            if (this.props.isShowDialog) {
                let isHasShowDialog = await PreferenceUtils.getBooleanSetting("HAS_SHOW_DIG_GOLD");
                console.log("isHasShowDialog: ", isHasShowDialog);
                if (!isHasShowDialog) {
                    PreferenceUtils.saveBooleanSetting("HAS_SHOW_DIG_GOLD", true);
                    DialogUtils.showQuestionDialog(null, getStringsCommon().xem_video_nhan_gold, {
                        text: getStringsCommon().Ok.toUpperCase(), onPress: () => {
                            this.btnViewAdsClick();
                        }
                    }, { text: getStringsCommon().Cancel.toUpperCase() });
                    return;
                }
            }
            this.btnViewAdsClick();
        }}>
            </Button>);
    }
    async btnViewAdsClick() {
        if (await RNAdsUtils.canShowRewardVideoAds()) {
            RNAdsUtils.showRewardVideoAds();
            this.props.onShowAds && this.props.onShowAds();
            this.setState({ isLoading: true });
            setTimeout(() => {
                RNAdsUtils.loadRewardVideoAds();
                this._startProgressCheckLoadAdsComplete();
            }, 1000);
        }
        else {
            RNAdsUtils.loadRewardVideoAds();
            Toast.showLongBottom(getStringsCommon().quang_cao_not_avail);
        }
    }
}
