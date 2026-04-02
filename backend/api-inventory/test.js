

// Create Express endpoint: POST /api/assessment/submit
// Body: { studentId, assessmentId, questionId, answer, timeSpent }
// 
// Requirements:
// 1. Authentication middleware
// Authenticate, Validation
// 2. Input validation middleware
// 3. Check if answer is correct
// 4. Update progress
// 5. Return feedback & score

// Questions
// {questionId, answer}
// Progress
// {studentId : {questionId: "id", score:"score"}}


/*
app.post('/api/assessment/submit', authenticate, validation, (req, res) => {
        const db = connectDB();
        const questionId = req.questionId;
        const dbResponse = db.Questions.findByID({where: questionId});
        if(!dbResponse) return 400;
        bool flag = false;
        if(dbResponse.answer != req.answer) {
            flag = false
        }
        else flag = true;

        const newStudent = {questionId: questionId, score: 72};
        const studentId = req.studentId;
        const updatedStudent = db.Progress.update( $push {where: studentId, newStudent});

        return {
            code: 200,
            message: "",
            feedback : flag,
            score: 72
        }

    })


*/