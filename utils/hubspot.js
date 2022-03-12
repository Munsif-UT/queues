import fetch from "node-fetch";

export const hubspot = async (full_name, email) => {

    let body = {
        "fields": [
            {
                "name": "email",
                "value": email
            },
            {
                "name": "full_name",
                "value": full_name
            }
        ],
        "context": {
            "pageUri": "https://app.inventooly.com/",
            "pageName": "OnBoard Page"
        },
        "legalConsentOptions": {
            "consent": {
                "consentToProcess": true,
                "text": "I agree to allow Inventooly to store and process my personal data.",
                "communications": [
                    {
                        "value": true,
                        "subscriptionTypeId": 999,
                        "text": "I agree to receive marketing communications from Inventooly."
                    }
                ]
            }
        }
    }

    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
    let res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTALID}/${process.env.HUBSPOT_FORMID}`, requestOptions)
    const data = await res.json();
    if(data){
        if(data?.status === "error" && data?.errors?.length > 0){
            return data?.errors[0]?.message ?? "Invalid Request"
        } else {
            return data?.inlineMessage ?? "Success"
        }
    }
    return data;
}