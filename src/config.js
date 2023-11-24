let api =
    document.location.hostname == "localhost"
        ? "http://localhost:2020"
        : "https://api.kluster-ai.online";

if (document.location.hostname.startsWith("172")) {
    api = "http://" + document.location.hostname + ":2020";
} else if (document.location.hostname.startsWith("192")) {
    api = "http://" + document.location.hostname + ":2020";
}

export { api };
