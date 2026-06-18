
document.addEventListener("DOMContentLoaded", function() {
    function change_output_area(content){
        let output_area = document.getElementById("output");
        try{
            output_area.innerHTML = content;
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    /*
    function toggle_the_visibility(element_id, visible) {
        var text_body = document.getElementById(element_id);
        if (text_body.style.display === "none") {
            text_body.style.display = "block";
        } else {
            text_body.style.display = "none";
        }

    }
    */
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
        const literal_content = [];
        if (!json || !Array.isArray(json.valid_urls) || !Array.isArray(json.valid_content)) {
            return literal_content;
        }

        for (let i = 0; i < json.valid_urls.length; i++) {
            let contentItem = json.valid_content[i];
            if (contentItem == null) continue;

            // If contentItem is an array, join it; otherwise convert to string
            let hay = Array.isArray(contentItem) ? contentItem.join('  ') : String(contentItem);

            if (hay.includes(term)) {
                literal_content.push(json.valid_urls[i]);
            }
        }

        return literal_content;

    }

    function format_links_as_divisions(literal_content) {
        const new_formated = [];
        for(let i = 0; i < literal_content.length; i++) {
            let div_content = "<a href=" + literal_content[i] +">" + literal_content[i] + "</a>";
            div_content += "<p> Example text </p>";
            let new_blob = "<div class=solution > " + div_content + "</div> <br>";
            new_formated.push(new_blob);
        }
        //return new_formatted.join("");
        return new_formated;
    }

    function search_impulse() {
        const userDataFromStorage = JSON.parse(localStorage.getItem('retrieved_data'));
        const user_term = document.getElementById("search-input").value.trim();

        if (!user_term) {
            change_output_area("<p>Please enter a search term.</p>");
            return;
        }

        const list_of_included_sites = search_through_object(userDataFromStorage, user_term);
        localStorage.setItem('search_results', JSON.stringify(list_of_included_sites));
        const html_formated_solutions = format_links_as_divisions(list_of_included_sites);
        change_output_area("<p>Search results: </p><br>" + list_of_included_sites.length + "<br> Sites: <br>" + html_formated_solutions);
    }

    function feelingLuckyPressed(){ // last feature to implement
        //const processed_solutions = localStorage.getItem('search_results');
        //window.open(processed_solutions[1]);
        alert("I guess you are feeling lucky now? ;)");
    }

    function file_upload_successful() {
        toggle_the_visibility("search_bar", true);
        const startProcessEvent = new Event('startProcess');
        document.dispatchEvent(startProcessEvent);
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
    document.getElementById("search-input").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            search_impulse();
        }
    });
    document.getElementById("lucky-button").addEventListener("click", feelingLuckyPressed);


    document.getElementById("reset-out").addEventListener("click", function () {
                if (document.getElementById("myfile").value != "") { 
                    var text_body = document.getElementById("output");
                    var new_string = "";
                    // reset the file input on the frontend
                    document.getElementById("myfile").value = "";
                    localStorage.clear();
                    toggle_the_visibility("file_input", false);
                    toggle_the_visibility("search_bar",false);
                    toggle_the_visibility("file_input", true)
                    
                    text_body.innerHTML = new_string;
            }});

            
            document.getElementById('myfile')
            .addEventListener('change', function () {

                let file_reader = new FileReader();

                file_reader.onload = function () {

                    // display text in browser
                //let result_formatted = file_reader.result.replace(/ /g, "<br>");

                //Display with HTML breaks
                //document.getElementById('output').innerHTML = result_formatted;
                document.getElementById('output').innerHTML = "Links loaded succesfully ✅ <br> Processing may take a while ...";
                

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
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        localStorage.setItem('retrieved_data', JSON.stringify(data));
                    });

                }

                file_reader.readAsText(this.files[0]);
                toggle_the_visibility("file_input", false);
                file_upload_successful();
            });

            
    toggle_the_visibility("search_bar", false);
});