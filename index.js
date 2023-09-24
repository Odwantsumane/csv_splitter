const express = require("express");
const app = express();
const cors = require('cors');
const router = require('./routes/api');
const formidable = require('formidable');
const fs = require('fs');
const XLSX = require('xlsx');
var path = require('path');

// set view engine (converts ejs to html)
app.set('view engine', 'ejs')

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));

// app.use("/api/users", router)

// temp campus storage
const campuses = [];

function display_data() {
    const csvPath = './public/students.csv';
    try {
        XLSX.readFile(csvPath);

        //
        separate_stud_by_campus(csvPath);
    } catch (e) {
        console.log("error");
    }
}


app.get("/", (req, res) => {
    res.render("index", {pop: false}); // default
})

app.get('/filter', (req, res) => {
    res.render("display-students", { campus: filter_by_campus("Campus 1"), options: No_of_options(), campusName: "Campus 1_students"});
})

app.post('/filter', (req, res) => {
    
    res.render("display-students", { campus: filter_by_campus(req.body.campus), options: No_of_options(), campusName: req.body.campus + "_students"});
})

app.post('/filter/search', (req, res) => {
    // console.log(req.body.searchData);
    res.render("display-students", { campus: search_by_name(filter_by_campus("Campus 1"), req.body.searchData), options: No_of_options(), 
        campusName: "Campus 1" + "_students"});
})

app.get('/filter/search/:searchData', (req, res) => {
     
    res.render("searchData", { campus: search_by_name(filter_by_campus(req.params.searchData.split("+")[1].replace("_", " ")), req.params.searchData.split("+")[0]), options: No_of_options(), 
    campusName: "Campus 1" + "_students"});
})

app.get("/settings", (req, res) => {
    res.render("settings"); // default
})

app.get("/hideForm", (req, res) => {
    res.render("_hiddenForm"); // default
})

app.get("/showForm", (req, res) => {
    res.render("formData", {pop: false}); // default
})


function filter_by_campus(campus) {
    if(campuses.length === 0) {
        return campuses;
    } else {
        return campuses[0][campus];
    }
}

function No_of_options() {
    if(campuses.length === 0) {
        return 0;
    } else {
        return Object.keys(campuses[0]).length; 
    }
}

// upload excel file
app.post("/upload", (req, res) => {

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.csvFile[0].filepath;
        var mimetype = files.csvFile[0].mimetype;
        
        // check for acceptable file type
        if (!(mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimetype === "text/csv")) {
            res.render("index", {pop: true});
           
        } else {

            // move file to public folder
            newpath = './public/' + "students.csv";

            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                console.log("file uploaded and moved successfully")
            });
            res.redirect('/filter');

            separate_stud_by_campus(newpath);
        }
        
    });
})

const separate_stud_by_campus = (newpath) => {
    
    // Load your Excel file

    const workbook = XLSX.readFile(newpath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Create an object to store students by campus
    const studentsByCampus = {};
    
    // Convert the Excel data into a JavaScript array of objects
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Group students by campus
    data.forEach(student => {
      const campus = student.Campus;
    
      if (!studentsByCampus[campus]) {
        studentsByCampus[campus] = [];
      }
      studentsByCampus[campus].push(student);
    });
    
    // Iterate through students by campus and save them to separate Excel files
    for (const campus in studentsByCampus) {
      const campusData = studentsByCampus[campus];
    
      // Create a new workbook
      const campusWorkbook = XLSX.utils.book_new();
      const campusWorksheet = XLSX.utils.json_to_sheet(campusData);
       
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(campusWorkbook, campusWorksheet, campus);
    
      // Save the workbook to a file
      XLSX.writeFile(campusWorkbook, `./public/campuses/${campus}_students.xlsx`);
    }
    
    // console.log('Separate Excel files have been created for each campus.');
    campuses.push(studentsByCampus);
    
    return true;
}

const search_by_name = (students_campus, input) => {
    const campus = students_campus;
    var result = [];

    // searching by name
    campus.forEach(student => {
        
        if(student.firstName.toLowerCase().replace(" ","_").includes(input.toLowerCase())) {
            result.push(student);
        }
    })

    return result;
}

display_data();

app.listen(4000, () => {
    console.log("running on http://localhost:4000");
})