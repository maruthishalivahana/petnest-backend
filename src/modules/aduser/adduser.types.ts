

export type { AdRequestType } from "../../validations/ad.validation";


export interface AdResponse {
    message: string;
    ad?: any;
    ads?: any[];
    data?: any;
}
