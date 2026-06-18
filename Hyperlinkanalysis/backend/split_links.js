// 1. detect links and split
// 2. normalize
// 3. regex
// 4. validate url
// 5. look if crawlable


var detected_links = [];
const textblob = "www.google.com\nhttps://www.schilderhaus.at/verkehrsschilder.htm?gad_source=1&gbraid=0AAAAAD-OVRmH6rHGL6bZaNPSfSUPmT3Ys&gclid=EAIaIQobChMIsK7OgPiRhwMV55GDBx1LAglEEAAYASAAEgI5k_D_BwE\nhttps://www.topgear.com\nhtps:yt.com";



// 1
function breakApartSingleLinks(text) {
    // Replace all <br> variations with \n
    text = text.replace(/<br\s*\/?>/gi, '\n');

    return text
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.trim() !== "");
}



// 2
function normalizeUrls(linklist) {
   
    for(let i = 0; i < linklist.length; i++) {
        try {
        const url = new URL(
            (linklist[i]).startsWith("http")
                ? (linklist[i])
                : "https://" + (linklist[i])
        );

        url.hash = "";  // remove fragment

        linklist[i] = url.href;
        
    } catch {
        linklist[i] = null;
    }
    }
    
}

function sortLinkList(linklist) {
    return (linklist.sort((a, b) => a.localeCompare(b)));
}

// 2.5
function dedupeLinkList(array) {
    return [...new Set(array)].sort((a, b) => a.localeCompare(b)); // return is a (constructed) array, that is being sorted
    //return Array.from(new Set(array)); // ES6 version
}


function urlDetection(textblob) {
    // the interface for index.js
    let new_list = breakApartSingleLinks(textblob);
    normalizeUrls(new_list);
    new_list = sortLinkList(new_list);
    new_list = dedupeLinkList(new_list);
    console.log(new_list);
    return new_list;
    
}

//urlDetection(textblob);

module.exports = { urlDetection };