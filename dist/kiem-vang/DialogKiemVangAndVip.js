import React, { Component } from 'react';
import { ButtonKiemVang } from "./ButtonKiemVang";
import { View } from 'react-native';
import { Button, ButtonModel, DialogUtils, PopupDialog, StyleUtils, TextCustom } from "my-rn-base-component";
import { PreferenceUtils } from "my-rn-base-utils";
const s = StyleUtils.getAllStyle();
export class DialogKiemVangAndVip extends Component {
    render() {
        return (<PopupDialog width={"85%"} ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
                <View style={{ padding: 12, flexDirection: "column" }}>
                    <TextCustom value={this.props.title} style={[s.f_nor, { marginBottom: 16 }]}/>
                    <ButtonKiemVang title={this.props.titleKiemVang} style={{ marginBottom: 8 }} model={ButtonModel.primary} onShowAds={this.props.onShowAds} onPress={async () => {
            this.dismiss(this);
            let gold = await PreferenceUtils.getNumberSetting("GOLD", 100);
            gold += 10;
            console.log("_Reward Received Callback: ", gold);
            await PreferenceUtils.saveSeting("GOLD", gold);
        }}/>
                    
                    <Button title="CLOSE" model={ButtonModel.danger} onPress={this.dismiss.bind(this)}/>
                </View>
            </PopupDialog>);
    }
    //region utils
    show(onShowed) {
        this.popupDialog.show();
    }
    dismiss(onDismissed) {
        this.popupDialog.dismiss();
    }
    static showDialog(props) {
        DialogUtils.showDialog(<DialogKiemVangAndVip {...props}/>);
    }
}
