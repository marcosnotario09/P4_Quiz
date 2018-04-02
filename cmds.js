const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

/**
*Muestra la ayuda.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.helpCmd = (socket, rl) => {
	log(socket, "Commandos:");
	log(socket, " h|help - Muestra esta ayuda.");
	log(socket, " list - Listar los quizzes existentes.");
	log(socket, " show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
	log(socket, " add - Añadir un nuevo quiz interactivamente");
	log(socket, " delete <id> - Borrar el quiz indicado.");
	log(socket, " edit <id>  - Editar el quiz indicado.");
	log(socket, " test <id> - Probar el quiz indicado.");
	log(socket, " p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log(socket, " credits - Créditos.");
	log(socket, " q|quit - Salir del programa.");
	rl.prompt();
};



const makeQuestion = (rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};



/**
*Añade un nuevo quiz al modelo.
*Pregunta interactivamente por la pregunta y la repsuesta.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.addCmd = (socket, rl) => {
	makeQuestion(rl, 'Introduzca una pregunta:')
	.then(q => {
		return makeQuestion(rl, 'Introduzca la respuesta:')
		.then(a =>{
			return {question:q, answer:a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then((quiz) => {
		log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);	
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


/**
*Borra un quiz del modelo.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (socket, rl, id) => {
	
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


/**
*Edita un quiz.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz){
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
		return makeQuestion(rl, 'Introduzca la pregunta:')
		.then (q => {
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
			return makeQuestion(rl, 'Introduzala respuesta:')
			.then(a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});
	})
	.then(quiz => {
		return quiz.save();
	})	
	.then(quiz => {
		log(socket, `Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};




/**
*Lista todos los quizzes existentes.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.listCmd = (socket, rl) => {
	
	models.quiz.findAll()
	.each(quiz => {
			log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
		})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});

};




const validateId = id => {
	return new Sequelize.Promise ((resolve, reject) => {
		if (typeof id === "undefined") {
			reject(new Error (`Falta el parametro <id>.`));
		} else {
			id = parseInt(id);
			if (Number.isNaN(id)) {
				reject(new Error(`El valor del parametro <id> no es un número.`));
			} else {
				resolve(id);
			}
		}
	});
};



/**Muetsra el quiz indicado.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a mostrar.
*/
exports.showCmd = (socket, rl, id) => {
	
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


/**
*Prueba un quiz, es decir, hace una pregunta en el modelo a la que debemos contestar.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a probar.
*/
exports.testCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}

		return makeQuestion(rl, `${quiz.question}?:`)
		.then(answerr => {
			if((answerr.toLowerCase()) === ((quiz.answer).toLowerCase().trim())) {
				log(socket, 'respuesta correcta', 'green');
			} else {
				log(socket, 'respuesta incorrecta', 'red');
			}
		})
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erroneo:');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};



 

/**
*Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
*Se gana si se contesta a todos satsifactoriamente.
*
*@param rl Objeto readline usado para implementar el CLI.
*/


exports.playCmd = (socket, rl) => {

	let score = 0;
	let toBePlayed = [];
	
	const playOne = () => {   //funcion

		return Promise.resolve()
		.then(() => {
		

			if(toBePlayed.length <= 0) {
			log(socket, "ENHORABUENA, acertaste todas", 'green');
			log(socket, `Has conseguido ${score} aciertos`, 'magenta');
			return; // para acaabr la funcion
			}


			let pos = Math.floor(Math.random()*toBePlayed.length);    //constante
			let quiz = toBePlayed[pos];
			toBePlayed.splice(pos, 1);

			return makeQuestion(rl, quiz.question)  //funcion que se ejecuta cuando promesa anterior ha terminado
			.then(answer => {
				if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
					score++;
					log(socket, "respuesta correcta", 'green');
					return playOne();

				} else {
					log(socket, "respuesta incorrecta", 'red');
					log(socket, "Fin del juego");
									
				}

			})

		})

	}

	models.quiz.findAll({raw: true})  //promesa que me dara los quizzes
	.then(quizzes => {
		toBePlayed = quizzes;
	})
	.then(() =>{
		return playOne();   //el playone se ejecuta cuando se rellene el quiz de nuevo
	})
	.catch(e => {
		console.log(socket, "Error:" + e);
	})
	.then(() =>{
		log(socket, `Has conseguido esta puntuación ${score}`);
		rl.prompt();

	})
};


/**
*Muestra los nombres de los autores de la práctica.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = (socket, rl) => {
	log(socket, 'Autores de la práctica:');
	log(socket, 'Marcos Notario', 'green');
	rl.prompt();
};


/**
*Terminar el programa.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
	rl.close();
};