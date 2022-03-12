import ErrorLogger from "../models/errorsLogs";
async function setErrorLogs(user = "NO User", error, pathName = "Not Defined") {
    const { name, message } = error;

    const errorLogger = new ErrorLogger({
        user: user,
        errName: name,
        errMsg: message,
        errPathName: pathName,
    });
    await errorLogger.save();
    return;
}
export default setErrorLogs;