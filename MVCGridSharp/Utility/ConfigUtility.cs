namespace MvcGridSharp.Utility;

public class ConfigUtility
{
    internal const string ShowErrorsAppSettingName = "MvcGridShowErrorDetail";

    [Obsolete("Will be removed soon due to compatability issues.")]
    public static T GetAppSetting<T>(string name, T defaultValue)
    {
        return defaultValue;

        //string val = ConfigurationManager.AppSettings[name];

        //if (String.IsNullOrWhiteSpace(val))
        //{
        //    return defaultValue;
        //}

        //var converter = TypeDescriptor.GetConverter(typeof(T));
        //var result = converter.ConvertFrom(val);

        //return (T)result;
    }

    public static bool GetShowErrorDetailsSetting()
    {
        return GetAppSetting<bool>(ShowErrorsAppSettingName, false);
    }
}
