
document.addEventListener("DOMContentLoaded", function () {
    function change_output_area(content) {
        let output_area = document.getElementById("output");
        try {
            output_area.innerHTML = content;
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    // default to regex !!!!!!!!!!!!!!!!!!!!!
    function regex_search_matching(text, term) { // returns a list
        // text = content
        // term = string
        const escaped_term = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex_ex = new RegExp(escaped_term, "gi");
        const matches = [...text.matchAll(regex_ex)];
        const regex_count = matches.length;
        const regex_indexes = matches.map(m => m.index);
        return [regex_count, regex_indexes];

    }

    function literal_search_matching(text, term) { // returns a list
        //const text = "hello world, hello universe, hello JS";
        //const term = "hello";

        let indexes = [];
        let pos = text.indexOf(term);

        while (pos !== -1) {
            indexes.push(pos);
            pos = text.indexOf(term, pos + term.length);
        }

        let literal_count = indexes.length;
        let literal_indexes = indexes;
        return [literal_count, literal_indexes];

    }


    function toggle_the_visibility(element_id, visible) {
        var element = document.getElementById(element_id);
        if (!element) return;

        if (visible) {
            element.classList.add("visible");
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
            element.classList.remove("visible");
        }
    }

    function search_through_object(json, term) {
        const storage = [];
        //const references_per_content = [];
        if (!json || !Array.isArray(json.valid_urls) || !Array.isArray(json.valid_content)) {
            return storage;
        }

        for (let i = 0; i < json.valid_urls.length; i++) {
            let contentItem = json.valid_content[i];
            if (contentItem == null) continue;

            // If contentItem is an array, join it; otherwise convert to string
            let hay = Array.isArray(contentItem) ? contentItem.join('  ') : String(contentItem);

            let [count_of_matches, match_indexes] = regex_search_matching(hay, term);
             if (count_of_matches > 0) {
            // Struktur: [0: Link, 1: Häufigkeit, 2: Referenzen (array of all positions)]
            storage.push([json.valid_urls[i], count_of_matches, match_indexes]);
            }

            
        }
        storage.sort((a, b) => b[1] - a[1]);

        return storage; // returns [URL, count, match_indexes] for each result

    }

    function format_links_as_divisions(literal_content) {
        const new_formated = [];
        for (let i = 0; i < literal_content.length; i++) {
            let div_content = "<a href=" + literal_content[i][0] + ">" + literal_content[i][0] + "</a>";
            const positions = literal_content[i][2].join(", ");
            div_content += "<p> Total appearance: " + literal_content[i][1] + " ;<br> At absolute string position: " + positions + " ;</p>";
            let new_blob = "<div class=solution > " + div_content + "</div> <br>";
            new_formated.push(new_blob);
        }
        //return new_formatted.join("");
        return new_formated;
    }

    function search_body() {
        const userDataFromStorage = JSON.parse(localStorage.getItem('retrieved_data'));
        const user_term = document.getElementById("search-input").value.trim();

        if (!user_term) {
            change_output_area("<p>Please enter a search term.</p>");
            return;
        }

        const array_containing_link_index_references = search_through_object(userDataFromStorage, user_term);
        return array_containing_link_index_references;

    }

    function search_impulse() {
        const uber_array = search_body();
        //localStorage.setItem('search_results', JSON.stringify(list_of_included_sites));
        const html_formated_solutions = format_links_as_divisions(uber_array);
        change_output_area("<p>Search results: </p><br>" + uber_array.length + "<br> Sites: <br>" + html_formated_solutions);
    }

    function feelingLuckyPressed() { // last feature to implement
        //const processed_solutions = localStorage.getItem('search_results');
        //window.open(processed_solutions[1]);
        const total_array = search_body();
        window.open(total_array[0][0]);
        alert("I guess you are feeling lucky now? ;)");
    }

    function file_upload_successful() {
        toggle_the_visibility("search_bar", true);
        //const startProcessEvent = new Event('startProcess');
        //document.dispatchEvent(startProcessEvent);
    }


    ////////////////////////////////
    const eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
        const project = JSON.parse(event.data);

        console.log(project.name);
        console.log(project.files);

        eventSource.close();
    };
    /////////////////////////////////
    document.getElementById("search-button").addEventListener("click", search_impulse);
    //document.getElementById("search-input").addEventListener("onfocus", this.value='');
    document.getElementById("search-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            search_impulse();
        }
    });
    document.getElementById("lucky-button").addEventListener("click", feelingLuckyPressed);


    document.getElementById("reset-out").addEventListener("click", function () {
        let text_body = document.getElementById("output");

        // reset the file input on the frontend
        document.getElementById("myfile").value = "";
        document.getElementById('search-input').value = "";
        localStorage.clear();
        toggle_the_visibility("file_input", false);
        toggle_the_visibility("search_bar", false);
        toggle_the_visibility("file_input", true);

        text_body.innerHTML = "";
    });


    document.getElementById('myfile')
        .addEventListener('change', function () {

            let file_reader = new FileReader();

            file_reader.onload = function () {

                // display text in browser
                //let result_formatted = file_reader.result.replace(/ /g, "<br>");

                //Display with HTML breaks
                //document.getElementById('output').innerHTML = result_formatted;
                toggle_the_visibility("file_input", false);
                change_output_area("📂 File loaded successfully ✅ <br> 🔄 Uploading to server ...");

                // send to backend
                fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: file_reader.result
                    })
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`Server error: ${res.status}`);
                        }
                        change_output_area("📂 File loaded successfully ✅ <br> 🔄 Processing your links ...");
                        return res.json();
                    })
                    .then(data => {
                        change_output_area("📂 File loaded successfully ✅ <br> 🔄 Processing your links ... <br> ✅ Data received. Your Search-Index is ready!");
                        file_upload_successful();
                        console.log(data);
                        localStorage.setItem('retrieved_data', JSON.stringify(data));
                    })
                    .catch(error => {
                        console.error('Error uploading file:', error);
                        change_output_area("❌ Error uploading file: " + error.message + "<br> Please try again.");
                        toggle_the_visibility("file_input", true);
                    });

            }

            file_reader.readAsText(this.files[0]);
            
        });


    toggle_the_visibility("search_bar", false);
});