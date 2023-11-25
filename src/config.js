let api =
    document.location.hostname == "localhost"
        ? "https://api.kluster-ai.online"
        : "https://api.kluster-ai.online";

if (document.location.hostname.startsWith("172")) {
    api = "http://" + document.location.hostname + ":2020";
} else if (document.location.hostname.startsWith("192")) {
    api = "http://" + document.location.hostname + ":2020";
}

export { api };
