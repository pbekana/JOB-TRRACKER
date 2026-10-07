package com.job_tracker.job.tracker;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class IndexController {

        @GetMapping("/")
        public String showindexPage(){
            return "index";
        }

    @GetMapping("/Applications")
    public String showappPage(){
        return "Applications";
    }
    @GetMapping("/Companies")
    public String showComPage(){
        return "Companies";
    }
    @GetMapping("/Timeline")
    public  String showTimeLine(){
            return "Timeline";
    }

    @GetMapping("/Login")
    public  String showLogin(){
        return "Login";
    }

    @GetMapping("/Contacts")
    public  String showContact(){
        return "Contacts";
    }

    @GetMapping("/Resources")
    public  String showResources(){
        return "Resources";
    }
    @GetMapping("/Home")
    public  String showHome(){
        return "Home";
    }

    @GetMapping("/About")
    public  String showAbout(){
        return "About";
    }

    @GetMapping("/Settings")
    public String showSettings(){
        return "Settings";
    }

}
