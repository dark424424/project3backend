var Application = require("../model/applications")
var Job = require("../model/jobs")
var User = require("../model/users")
var Company = require('../model/companies')
var Role = require('../model/roles')
// var ElasticClient = require("../../infrastructure/elasticSearch")


const SearchService = {
    searchJob: async (body,pageNumber, limit) => {
        if(!limit){
            limit = 50;
        }
        let query = {};
        if(body.text){
            query.$text = {}
            query.$text.$search = body.text;
           
        }
        let checkDate = { "info.outdate": { $gt: new Date() }}
        let checkStatus = {'status.value': 0}
        let newQuery =  {...query,...checkDate ,...body.filter,  ...checkStatus}
        // console.log(newQuery)
        let result;
        if(body.text){
            result = await Job.find(newQuery).sort( { score: { $meta: "textScore" } } ).limit(limit).skip(50*pageNumber).select({status: 0}).populate({path: "companyId", select: {"info.name" : 1, "info.benefits": 1, "info.logo": 1}});
        }else{
            result = await Job.find(newQuery).sort({'info.outdate': 1}).limit(limit).skip(limit*pageNumber).select({status: 0}).populate({path: "companyId", select: {"info.name" : 1, "info.benefits": 1, "info.logo": 1}});
        }
        const count = await Job.find(newQuery).count()
        //TO DO: làm thêm filter skip limit offset
        if(result){
            return {total: count, data: result};
        }else{
            throw new Error(" error")
        }
    },
    searchCandidate: async (body) => {
        let query = {};
        if(body.text){
            query.$text = {}
            query.$text.$search = body.text;
        }
        let newQuery =  {...query,roleNumber: 0, "info.allowSearchInfo":true, ...body.filter, }
        // console.log(newQuery)
        const result = await User.find(newQuery).select({info: 1, email: 1})
            //TO DO: làm thêm filter skip limit offset
        if(result){
            return result;
        }else{
            throw new Error(" error")
        }
    }
}


module.exports = SearchService;