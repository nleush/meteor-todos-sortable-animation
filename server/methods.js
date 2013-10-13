Meteor.methods({
    refreshChatTime: function (_id) {
        Chat.update({_id: _id}, {
            $set:{
                timestamp: new Date().getTime()
            }
        });
    },
    initUser: function() {
        if (!this.userId) {
            var count = Meteor.users.find({}, {}).count();
            var username = 'user' + count;
            Accounts.createUser({
                username: username,
                password: 'password'
            });
            return username;
        }
    }
});