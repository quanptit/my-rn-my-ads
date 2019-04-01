import { Component } from 'react';
import { ButtonProps } from "my-rn-base-component";
interface Props extends ButtonProps {
    /** true => sẽ show dialog 1 lần là xem video 30s sẽ nhận được 30 vàng*/
    isShowDialog?: boolean;
    onShowAds: () => void;
}
/**Nếu video chưa ready => loading, load xong show cái title*/
export declare class ButtonKiemVang extends Component<Props, {
    isLoading: any;
}> {
    private timeInterval;
    constructor(props: any);
    rewardVideoAdDidReceiveCallback(): void;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    _startProgressCheckLoadAdsComplete(): void;
    _cancelProgressCheckLoadAdsComplete(): void;
    render(): JSX.Element;
    btnViewAdsClick(): Promise<void>;
}
export {};
