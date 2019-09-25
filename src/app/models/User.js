
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Op = require('sequelize').Op;

module.exports = (sequelize, Sequelize) => {

	const User = sequelize.define('User', {
		name: Sequelize.STRING,
		email: Sequelize.STRING,
		password: Sequelize.STRING
	}, {
		tableName: 'user'
	});
	
	User.findOneById = function(id) {
		return User.findOne({
			where: { id }
		});
	}
	
	User.findOneByEmail = function(email) {
		return User.findOne({ 
			where: { email } 
		});
	}

	User.findOneByStringIdentifier = function(stringIdentifier) {
		return User.findOne({
			where: { [Op.or] : { name: stringIdentifier, email: stringIdentifier } }
		});
	}

	User.verifyCredentials = function(stringIdentifier, plainPassword) {
		return new Promise((resolve) => {
			User.findOneByStringIdentifier(stringIdentifier)
			.then(user => !user ? resolve(null) : user.verifyPassword(plainPassword))
			.then(result => result ? resolve(result) : resolve(null));
		});	
	}

	User.prototype.verifyPassword = function(plainPassword) {
		return new Promise((resolve) => {
			bcrypt.compare(plainPassword, this.password)
			.then(result => !result ? resolve(null) : resolve(this));
		});
	}

	User.prototype.hashPassword = function() {
		return new Promise((resolve) => {
			bcrypt.hash(this.password, 10)
			.then((hash) => {
				this.password = hash
				resolve(this);
			});
		});
	}

	User.prototype.getBarearToken = function() {
		return jwt.sign({ email : this.email }, "secret");
	}

	return User;

}