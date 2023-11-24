const req = async (url, obj) => {
    const token = localStorage.getItem("token") || "";
    obj = obj || {};
    obj.headers = {};
    obj.headers["Authorization"] = "Bearer " + token;
    obj.headers["Content-Type"] = "application/json";
    if(obj){
        return await fetch(url,obj)
    }else{
        return await fetch(url)
    }
}

export default req;