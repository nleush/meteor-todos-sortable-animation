Meteor.methods({
    refreshChatTime: function (_id) {
        Chat.update({_id: _id}, {
            $set:{
                timestamp: new Date().getTime()
            }
        });
    }
});