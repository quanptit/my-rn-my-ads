import { Component } from 'react';
import { ViewProps } from 'react-native';
interface Props extends ViewProps {
    title: string;
    titleKiemVang: string;
    onShowAds: VoidFunction;
}
export declare class DialogKiemVangAndVip extends Component<Props> {
    private popupDialog;
    render(): JSX.Element;
    show(onShowed?: any): void;
    dismiss(onDismissed?: any): void;
    static showDialog(props: Props): void;
}
export {};
