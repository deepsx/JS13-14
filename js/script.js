// Тест может иметь не ограниченное количество вопросов, ответов к нему.
// Правильных ответов может быть больше одного
// По итогам теста создается массив userAnswers, куда добавлены записи по
// количеству вопросов (name/id вопроса, текст ответа, оценка за ответ (0  или 1)),
// максимальная оценка за тест (по 1 баллу за вопрос), итоговая сумма баллов
"use strict";
$(function() {
    var quizData = {
        name: "SIMPLE HTML TEST",
        data: [{
            question: "What does HTML stand for?",
            answers: ["Hyperlinks and Text Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language", "HiT My Leg"],
            rightAnswer: ["Hyper Text Markup Language"]
        }, {
            question: "Who is making the Web standards?",
            answers: ["Google", "The World Wide Web Consortium", "GoIT", "Skype"],
            rightAnswer: ["The World Wide Web Consortium"]
        }, {
            question: "Which character is used to indicate an end tag?",
            answers: ["<", "*", ":)", "/"],
            rightAnswer: ["/"]
        },
        {
          question: "What is RGB?",
          answers: ["Red", "Rocket", "Grenade", "Green", "Black", "Blue", "Bomb"],
          rightAnswer: ["Red", "Green", "Blue"]

        }
      ]
    };
    // Записываем JSON с данными теста в хранилище
    var localSet = JSON.stringify(quizData);
    localStorage.setItem('quiz', localSet);
    // Забираем JSON из хранилища и парсим
    var localGet = localStorage.getItem('quiz');
    var quiz = JSON.parse(localGet);
    var html = $('#quiz').html();
    var content = tmpl(html, quiz);
    $('.wrapper').append(content);
// Обьект для управления модальным окном. Принимает тип окна: warning (если тест
// не закончен), results (если тест закончен). Вторым аргументом приходит массив
// с ответами и оценками пользователя
    var modal = {
        show: function(type, data) {
          var text, modal, result, title, answersList, answersListRecord, mark, footer, overlay;
            modal = $('<div class="modal"></div>');
            if (type === 'warning') {
                text = $('<div class="modal-body"><p>Please answer all questions</p></div>');
            } else if (type === 'results') {
                result = (Math.round((data.quizResult / data.maxResult) * 100) / 100) * 100;
                text = $('<div class="modal-body"><p>Right answers: ' + data.quizResult + ' from ' + data.maxResult + '</p></div>');
                answersList = $('<div></div>');
                for (var z = 0; z < data.length; z++) {
                  if (data[z].mark === 1) {
                    mark = '1 point';
                  } else {
                    mark = '0 point';
                  }
                  answersListRecord = $('<p>Question #' + (z + 1) + ' - ' + mark + '</p>');
                  answersList.append(answersListRecord);
                }
                text.append($('<p>Your score: ' + result + '%</p>'));
                text.append(answersList);
            } else {
                return;
            }
            title = $('<div class="modal-head"><span>' + data.quizName + '</span><span class="modal-btn-top modal-close">X</span></div>');
            footer = $('<div class="modal-footer"><span class="modal-btn-bottom modal-close">Close</span></div>');
            overlay = $('<div class="modal__overlay">');
            modal.append(title);
            modal.append(text);
            modal.append(footer);
            $('body').append(overlay);
            $('body').append(modal);
// Одноразовый обработчик. Удаляет модальное окно. Очищает чекбоксы, если тест
// завершен
            $('.modal-close').one('click', hide);
            function hide() {
                modal.remove();
                overlay.remove();
                if (data.quizResult >= 0) {
                  $('.quiz input[type="checkbox"]').prop('checked', false);
                  data = [];
                }
            }
        }
    };
    var $quizResults;
    // Обработчик. Проверяет все ли вопросы отвечены. Если да, то генерирует массив
    // userAnswers, куда записывает название теста, ответы пользователя, оценку за
    // каждый вопрос и общую оценку за тест
    $('.btn-submit').click(function(e) {
        e.preventDefault();
        // Проверка все ли вопросы отвечены
        var answersCount = 0;
        var questionsCount = quiz.data.length;
        var questionName = '';
        $quizResults = $('input[type="checkbox"]:checked');
        $quizResults.each(function() {
            if ($(this).attr('name') != questionName) {
                answersCount += 1;
                questionName = $(this).attr('name');
            }
        });
        // Если отвечены не все вопросы, то просим ответить на все вопросы
        var quizFinished;
        var userAnswers = [];
        userAnswers.quizName = quiz.name;
        if (answersCount < questionsCount) {
            modal.show('warning', userAnswers); // Создаем модальное окно с предупреждением
            quizFinished = false;
        } else {
            quizFinished = true;
        }
        if (!quizFinished) { // Если тест не завершен, то и считать нечего
            return;
        }
        // Создаем объект, в который записываем id вопроса и ответы пользователя к нему
        var questionId;
        var questionText;
        var answerNumber = -1;
        $quizResults.each(function() {
            questionText = $(this).parent().text().trim();
            if ($(this).attr('name') != questionId) {
                questionId = $(this).attr('name');
                answerNumber += 1;
                userAnswers[answerNumber] = {};
                userAnswers[answerNumber].id = questionId;
                userAnswers[answerNumber].answers = [];
            }
            userAnswers[answerNumber].answers.push(questionText);
        });
        userAnswers.maxResult = answersCount;
        userAnswers.quizResult = 0;
        // Имея объект userAnswers, в котором перечислены вопросы и ответы
        // пользователя к ним, можно сверить их с объектом quiz.data
        // Если количество ответов пользователя совпадает с количеством
        // верных ответов к вопросу, то сверяем их. Если нет, то ответ сразу не
        // засчитываем
        var arr, elem;
        for (var x = 0; x < userAnswers.length; x++) {
            if (userAnswers[x].answers.length === quiz.data[x].rightAnswer.length) {
                for (var i = 0; i < userAnswers[x].answers.length; i++) {
                    arr = userAnswers[x].answers;
                    elem = quiz.data[x].rightAnswer[i];
                    if (arr.indexOf(elem) < 0) {
                        userAnswers[x].mark = 0;
                        break;
                    }
                    userAnswers[x].mark = 1;
                }
            } else {
                userAnswers[x].mark = 0;
            }
        }
        // Подсчитываем общий результат теста (сумму балов)
        for (var y = 0; y < userAnswers.length; y++) {
            userAnswers.quizResult += userAnswers[y].mark;
        }
        // Вызываем метод show у объекта modal, отправляем массив с ответами
        modal.show('results', userAnswers);
    });

});
