var selected="None"
function rock()
{
	if (selected!="r")
	{
		selected="r"
		s.style="border: 8px solid red;"
		p.style="border: 8px solid red;"
		r.style="border: 8px solid green;"
	}
}
function paper()
{
	if (selected!="p")
	{
		selected="p"
		s.style="border: 8px solid red;"
		p.style="border: 8px solid green;"
		r.style="border: 8px solid red;"
	}
}
function scissors()
{
	if (selected!="s")
	{
		selected="s"
		s.style="border: 8px solid green;"
		r.style="border: 8px solid red;"
		p.style="border: 8px solid red;"
	}
}