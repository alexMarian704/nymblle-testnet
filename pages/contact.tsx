import { FormControl, NumberInput, NumberInputField, Radio, RadioGroup, Select, Stack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { HeaderMenu } from '../components/ui/HeaderMenu'
import { MainLayout } from '../components/ui/MainLayout'
import style from "../style/Contact.module.css"
import supabase from '../config/supabaseConfig'
import { useRouter } from 'next/router'

const contact = () => {
    const router = useRouter()
    const [creatorType, setCreatorType] = useState("individual");
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [help, setHelp] = useState("")
    const [company, setCompany] = useState("");
    const [topic, setTopic] = useState("");
    const [teamSize, setTeamSize] = useState("")
    const [industry, setIndustry] = useState("")

    const industryOptions = ["Choose an industry", "Gaming", "Education", "Apps", "Advertising", "Mobile", "Information Technology", "Real Estate", "Music and Audio", "Investments", "Software", "Sports", "Video", "Payments", "Sales and Marketing", "Health Care", "Other"]

    const teamSizeOptions = ["Choose a company size", "1-50", "50-100", "100-500", "500-1000", "1000-5000", "5000+"]

    const topicOptions = ["Choose a topic", "Partnership", "Smart Contracts Build", "FrontEnd DAPP/DAO", "Full Build", "Other"]

    const parse = (val: string) => val.replace(/^\$/, '')

    return (
        <MainLayout>
            <HeaderMenu>
                <button className={style.resetButton} onClick={() => {
                    setStep(1)
                    setFirstName("")
                    setLastName("")
                    setEmail("")
                    setPhone("")
                    setHelp("")
                    setCompany("")
                    setTopic("")
                    setTeamSize("")
                    setIndustry("")
                }} ><i className="bi bi-arrow-repeat"></i>Start Over</button>
            </HeaderMenu>
            {step !== 5 && <p className={style.logoP}><i className="bi bi-stack"></i></p>}
            {step === 5 && <p className={style.requestIcon}><i className="bi bi-envelope-check-fill"></i></p>}
            <p style={{
                width: "100%",
                textAlign: "center",
                fontSize: "calc(29px + 0.1vw)",
                fontWeight: 900,
            }}>{step === 1 ? "Hello! Welcome to nymblle." : step === 2 ? "Tell us about your team or business." : step === 4 ? "Almost done! Tell us what you’re looking for." : step === 5 ? "We have received your request and will contact you as soon as possible." : "Tell us more about yourself."}</p>
            {step === 1 && <p style={{
                width: "100%",
                textAlign: "center",
                fontSize: "calc(20px + 0.1vw)",
                fontWeight: 400,
                color: "rgb(210,210,210)",
                marginTop: "20px"
            }}>Please tell us about yourself and a member of our team will be in touch with you shortly.</p>}

            {step === 1 && <RadioGroup onChange={setCreatorType} value={creatorType}
                marginTop="60px"
            >
                <div className={style.radioDiv}>
                    <Radio value="individual"
                        width="100%"
                        size="lg"
                    >I'm and individual creator</Radio>
                </div>
                <div className={style.radioDiv}>
                    <Radio value="team"
                        width="100%"
                        size="lg"
                    >I represent a team</Radio>
                </div>
            </RadioGroup>}
            {step === 2 &&
                <div>
                    <div className={style.formSection}>
                        <label>Company or Team Name</label>
                        <input type="text" value={company} onChange={(e) => { setCompany(e.target.value) }} placeholder="Company or Team Name" />
                    </div>
                    <div className={style.formSection}>
                        <label>Industry</label>
                        <Select
                            background="rgba(3, 111, 90, 0.6)"
                            border="1px solid rgb(100, 100, 100)"
                            borderColor="rgb(100, 100, 100)"
                            onChange={(e) => {
                                setIndustry(e.target.value)
                            }}
                        >
                            {industryOptions.map((value) => (
                                <option key={value} value={value} style={{
                                    background: "rgb(18,18,18)",
                                }}>{value}</option>
                            ))}
                        </Select>
                    </div>
                    <div className={style.formSection}>
                        <label>Company or Team Size</label>
                        <Select
                            background="rgba(3, 111, 90, 0.6)"
                            border="1px solid rgb(100, 100, 100)"
                            borderColor="rgb(100, 100, 100)"
                            onChange={(e) => {
                                setTeamSize(e.target.value)
                            }}
                        >
                            {teamSizeOptions.map((value) => (
                                <option key={value} value={value} style={{
                                    background: "rgb(18,18,18)",
                                }}>{value}</option>
                            ))}
                        </Select>
                    </div>
                </div>}
            {step === 3 &&
                <div>
                    <div className={style.formSection}>
                        <label>First Name</label>
                        <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value) }} placeholder="First Name" />
                    </div>
                    <div className={style.formSection}>
                        <label>Last Name</label>
                        <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value) }} placeholder="Last Name" />
                    </div>
                    <div className={style.formSection}>
                        <label>Email</label>
                        <input type="text" value={email} onChange={(e) => { setEmail(e.target.value) }} placeholder="Email" />
                    </div>
                    <div className={style.formSection}>
                        <label>Phone Number(optional)</label>
                        <NumberInput value={phone} onChange={(e: string) => { setPhone(parse(e)) }}
                            height="calc(67px + 0.1vw)"
                        >
                            <NumberInputField placeholder='Phone Number'
                                border="none"
                                height="100%"
                            />
                        </NumberInput>
                    </div>
                </div>}
            {step === 4 &&
                <div>
                    <div className={style.formSection}>
                        <label>What Are You Interested In</label>
                        <Select
                            background="rgba(3, 111, 90, 0.6)"
                            border="1px solid rgb(100, 100, 100)"
                            borderColor="rgb(100, 100, 100)"
                            onChange={(e) => {
                                setTopic(e.target.value)
                            }}
                        >
                            {topicOptions.map((value) => (
                                <option key={value} value={value} style={{
                                    background: "rgb(18,18,18)",
                                }}>{value}</option>
                            ))}
                        </Select>
                    </div>
                    <div className={style.formSection}>
                        <label>How can we help</label>
                        <textarea value={help} onChange={(e) => { setHelp(e.target.value) }} placeholder="Tell us how we can help you" />
                    </div>
                </div>}
            {step <= 4 && <button disabled={step === 1 ? false : (step === 3 && firstName !== "" && lastName !== "" && email !== "") ? false : (step === 2 && company !== "" && industry !== "" && teamSize !== "") ? false : (step === 4 && topic !== "" && help !== "") ? false : true} type='button' style={{
                background: step === 1 ? "rgb(227,227,227)" : (step === 3 && firstName !== "" && lastName !== "" && email !== "") ? "rgb(227,227,227)" : (step === 2 && company !== "" && industry !== "" && teamSize !== "") ? "rgb(227,227,227)" : (step === 4 && topic !== "" && help !== "") ? "rgb(227,227,227)" : "rgb(100,100,100)"
            }} className={style.nextStep} onClick={async () => {
                if (step === 4) {
                    const { data, error } = await supabase
                        .from("email")
                        .insert([{ firstName, lastName, email, phone, help, company, topic, teamSize, industry, creatorType }])

                    setStep(step + 1);
                } else {
                    let cStep = step;
                    cStep++;
                    if (creatorType == "individual" && step === 1) {
                        cStep++;
                    }
                    setStep(cStep);
                }
            }}>{step === 4 ? "Submit" : "Next Step"}</button>}
            {step > 4 && <button className={style.nextStep} onClick={() => {
                router.push("/")
            }} ><i style={{
                color:"rgb(3, 151, 90)"
            }} className="bi bi-house-fill"></i> Home</button>}
        </MainLayout>
    )
}

export default contact