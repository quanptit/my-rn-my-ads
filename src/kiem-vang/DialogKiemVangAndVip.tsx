import React, {Component} from 'react'
import {ButtonKiemVang} from "./ButtonKiemVang"

import {View, ViewProps} from 'react-native'
import {Button, ButtonModel, DialogUtils, PopupDialog, StyleUtils, TextCustom} from "my-rn-base-component";
import {PreferenceUtils} from "my-rn-base-utils";

const s = StyleUtils.getAllStyle();

interface Props extends ViewProps {
    title: string,
    titleKiemVang: string,
    onShowAds: VoidFunction
}

export class DialogKiemVangAndVip extends Component<Props> {
    private popupDialog: any;

    render() {
        return (
            <PopupDialog
                width={"85%"}
                ref={(popupDialog) => { this.popupDialog = popupDialog }}>
                <View style={{padding: 12, flexDirection: "column"}}>
                    <TextCustom value={this.props.title} style={[s.f_nor, {marginBottom: 16}]}/>
                    <ButtonKiemVang title={this.props.titleKiemVang} style={{marginBottom: 8}}
                                    model={ButtonModel.primary}
                                    onShowAds={this.props.onShowAds}
                                    onPress={async () => {
                                        this.dismiss(this);
                                        let gold = await PreferenceUtils.getNumberSetting("GOLD", 100);
                                        gold += 10;
                                        console.log("_Reward Received Callback: ", gold);
                                        await PreferenceUtils.saveSeting("GOLD", gold);
                                    }}/>
                    {/*<Button title={getString("nang_cap_vip_50k")} style={{marginTop: 8, marginBottom: 8}} onPress={this.btnNangCapVip.bind(this)}/>*/}
                    <Button title="CLOSE" model={ButtonModel.danger} onPress={this.dismiss.bind(this)}/>
                </View>
            </PopupDialog>

        )
    }

    //region utils
    show(onShowed?: any) {
        this.popupDialog.show()
    }

    dismiss(onDismissed?: any) {
        this.popupDialog.dismiss()
    }

    public static showDialog(props: Props) {
        DialogUtils.showDialog(<DialogKiemVangAndVip {...props}/>)
    }

    //endregion
}
